#!/usr/bin/env node
// Helper for the verify-rwa skill. Run from the repo root:
//   node .claude/skills/verify-rwa/scripts/rwa.mjs <start [--port N]|doctor|exec|cypress|stop|status>
// Ports: frontend N (default 3000), API N+1. Use different ports per git worktree to run in parallel.
// Every run gets an evidence folder: .verify-runs/<runId>/ (git-ignored). runId is UTC time.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const RUNS = path.join(ROOT, ".verify-runs");
const STATE = path.join(RUNS, "current.json");
const DEFAULT_PORT = 3000;
const portsFor = (frontend) => ({ frontend, api: frontend + 1 });
const runPorts = (run) => run.ports || portsFor(DEFAULT_PORT);
const DB_FILE = "data/database.json";
const IS_WIN = process.platform === "win32";
const READY_TIMEOUT_S = 150;

const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJson = (p, fallback) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : fallback);
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
const git = (...args) => spawnSync("git", args, { cwd: ROOT, encoding: "utf8" }).stdout.trim();

// ---------------------------------------------------------------- process ownership
// Windows has no process groups and the shell that launched 'yarn dev' can die while its
// children keep running. So on Windows we record the whole tree (pid + creation time, to
// guard against pid reuse) once the app is ready, and only ever kill what we recorded.
function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function winProcesses() {
  const ps =
    "Get-CimInstance Win32_Process | ForEach-Object { $c = if ($_.CreationDate) { $_.CreationDate.ToString('o') } else { '' }; " +
    "'{0}|{1}|{2}|{3}' -f $_.ProcessId, $_.ParentProcessId, $_.Name, $c }";
  const r = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  });
  return r.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => {
      const [pid, ppid, name, created] = l.split("|");
      return { pid: +pid, ppid: +ppid, name, created };
    });
}

function winTree(rootPid, table) {
  const out = table.filter((p) => p.pid === rootPid);
  for (let i = 0; i < out.length; i++) out.push(...table.filter((p) => p.ppid === out[i].pid));
  return out;
}

function liveRecorded(run, table = winProcesses()) {
  return (run.tree || []).filter((t) => table.some((p) => p.pid === t.pid && p.created === t.created));
}

function runAlive(run) {
  if (!IS_WIN) {
    try {
      process.kill(-run.pid, 0); // whole process group
      return true;
    } catch {
      return false;
    }
  }
  return run.tree ? liveRecorded(run).length > 0 : alive(run.pid);
}

function winListeners(port) {
  const r = spawnSync("netstat", ["-ano"], { encoding: "utf8", windowsHide: true });
  const pids = r.stdout
    .split(/\r?\n/)
    .filter((l) => /LISTENING/.test(l) && new RegExp(`:${port}\\s`).test(l))
    .map((l) => +l.trim().split(/\s+/).pop());
  return [...new Set(pids)];
}

function ownedByRun(pid, run, table) {
  const recorded = new Set(liveRecorded(run, table).map((t) => t.pid));
  for (let p = table.find((x) => x.pid === pid), i = 0; p && i < 40; p = table.find((x) => x.pid === p.ppid), i++) {
    if (recorded.has(p.pid)) return true;
  }
  return false;
}

function portInUse(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ port, host: "localhost", autoSelectFamily: true });
    const done = (v) => (sock.destroy(), resolve(v));
    sock.setTimeout(1500, () => done(true)); // unknown -> treat as busy (safer)
    sock.once("connect", () => done(true));
    sock.once("error", () => done(false));
  });
}

async function httpCheck(url, timeoutMs = 3000) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    return { status: res.status, body: await res.text() };
  } catch (e) {
    return { status: 0, body: "", error: e.cause?.code || e.name };
  }
}

function loadRun() {
  const run = readJson(STATE, null);
  if (!run) {
    console.error("No active verify run. Start one with: rwa.mjs start");
    process.exit(2);
  }
  return run;
}

// ---------------------------------------------------------------- doctor
async function doctor(run, { quiet = false } = {}) {
  const PORTS = runPorts(run);
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok, detail });

  if (IS_WIN) {
    const table = winProcesses();
    for (const [name, port] of Object.entries(PORTS)) {
      const pids = winListeners(port);
      const ok = pids.length > 0 && pids.every((pid) => ownedByRun(pid, run, table));
      add(`:${port} (${name}) is served by this run`, ok, pids.length ? `listener pid ${pids.join(",")}` : "nothing listening");
    }
  } else {
    add("this run's process group is alive", runAlive(run), `pgid ${run.pid}`);
  }

  const api = await httpCheck(`http://localhost:${PORTS.api}/testData/users`);
  let users = [];
  try {
    users = JSON.parse(api.body).results || [];
  } catch {}
  add("API serves seeded users", api.status === 200 && users.length > 0,
    `GET :${PORTS.api}/testData/users -> ${api.status || api.error}, ${users.length} users`);

  const fe = await httpCheck(`http://localhost:${PORTS.frontend}/signin`);
  add("frontend serves /signin", fe.status === 200 && fe.body.includes('id="root"'),
    `GET :${PORTS.frontend}/signin -> ${fe.status || fe.error}`);

  // Vite's own config is not strictPort: if the port were taken it would silently move on. Prove it bound ours.
  const logPath = path.join(ROOT, run.evidenceDir, "dev.log");
  const log = fs.existsSync(logPath) ? stripAnsi(fs.readFileSync(logPath, "utf8")) : "";
  const viteLine = (log.match(/Local:\s+(http:\/\/\S+)/) || [])[1] || "not found";
  add(`this run's Vite bound :${PORTS.frontend}`, viteLine.includes(`:${PORTS.frontend}/`), `dev.log Local: ${viteLine}`);

  const result = { ok: checks.every((c) => c.ok), at: new Date().toISOString(), checks };
  writeJson(path.join(ROOT, run.evidenceDir, "doctor.json"), result);
  if (!quiet) {
    for (const c of checks) console.log(`${c.ok ? "ok  " : "FAIL"}  ${c.name}  (${c.detail})`);
    console.log(result.ok ? "doctor: healthy" : "doctor: UNHEALTHY - do not trust test results from this instance");
  }
  return result;
}

// ---------------------------------------------------------------- start
function parsePort(args) {
  const i = args.indexOf("--port");
  const raw = i !== -1 ? args[i + 1] : process.env.RWA_PORT;
  if (raw === undefined) return DEFAULT_PORT;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1024 && n < 65535 ? n : null;
}

async function start(args) {
  const port = parsePort(args);
  if (port === null) {
    console.error("Usage: rwa.mjs start [--port N]   (N = frontend port, 1024-65534; the API uses N+1)");
    return 2;
  }
  const PORTS = portsFor(port);
  const existing = readJson(STATE, null);
  if (existing && runAlive(existing)) {
    console.error(`A verify run is already active: ${existing.runId}. Reuse it, or run 'stop' first.`);
    return 2;
  }
  if (existing) {
    console.log(`Note: removing stale state from run ${existing.runId} (its processes are gone).`);
    fs.rmSync(STATE);
  }

  for (const [name, port] of Object.entries(PORTS)) {
    if (await portInUse(port)) {
      console.error(
        `BLOCKED: port ${port} (${name}) is already in use by a process this run did not start.\n` +
          `Do not kill it. Find the owner (Windows: netstat -ano | findstr :${port}; Linux/macOS: lsof -i :${port}) and report it.`
      );
      return 3;
    }
  }

  const runId = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  const evidenceDir = path.join(RUNS, runId);
  fs.mkdirSync(evidenceDir, { recursive: true });

  const run = {
    runId,
    evidenceDir: rel(evidenceDir),
    startedAt: new Date().toISOString(),
    commit: git("rev-parse", "HEAD"),
    branch: git("branch", "--show-current"),
    dirtyAtStart: git("status", "--porcelain").split("\n").filter(Boolean),
    dbCleanAtStart: git("status", "--porcelain", "--", DB_FILE) === "",
    node: process.version,
    platform: process.platform,
    ports: PORTS,
  };

  // POSIX: detached = own process group, so 'stop' can signal the whole group.
  // Windows: NOT detached. A detached process has no console, so each child gets its own hidden
  // console and the servers' output never reaches dev.log.
  // Same steps as 'yarn dev' (predev seeding, then React + API under concurrently), but with explicit
  // ports: Vite gets --port/--strictPort (its config hard-codes 3000 and would silently move), the API
  // and its CORS origin read VITE_BACKEND_PORT and PORT, and the browser bundle reads VITE_BACKEND_PORT.
  const out = fs.openSync(path.join(evidenceDir, "dev.log"), "w");
  const devCommand =
    `yarn -s db:seed:dev && yarn -s concurrently -k -n react,api ` +
    `"vite --port ${PORTS.frontend} --strictPort" "yarn -s start:api:watch"`;
  run.devCommand = devCommand;
  const child = spawn(devCommand, {
    cwd: ROOT,
    shell: true,
    detached: !IS_WIN,
    windowsHide: true,
    stdio: ["ignore", out, out],
    env: { ...process.env, NODE_ENV: "development", PORT: String(PORTS.frontend), VITE_BACKEND_PORT: String(PORTS.api) },
  });
  child.unref();
  run.pid = child.pid;
  writeJson(STATE, run);
  console.log(`run ${runId}: started the app on :${PORTS.frontend} (API :${PORTS.api}), pid ${run.pid}, commit ${run.commit.slice(0, 7)} on ${run.branch}`);
  console.log(`evidence: ${run.evidenceDir}/`);

  const t0 = Date.now();
  while (Date.now() - t0 < READY_TIMEOUT_S * 1000) {
    if (!alive(run.pid)) break;
    const [fe, api] = await Promise.all([
      httpCheck(`http://localhost:${PORTS.frontend}/`, 1500),
      httpCheck(`http://localhost:${PORTS.api}/testData/users`, 1500),
    ]);
    if (fe.status === 200 && api.status === 200) {
      if (IS_WIN) run.tree = winTree(run.pid, winProcesses()).map(({ pid, name, created }) => ({ pid, name, created }));
      writeJson(STATE, run);
      writeJson(path.join(evidenceDir, "run.json"), run);
      console.log(`ready after ${Math.round((Date.now() - t0) / 1000)}s${IS_WIN ? ` (${run.tree.length} processes recorded)` : ""}`);
      const d = await doctor(run);
      return d.ok ? 0 : 5;
    }
    await sleep(1000);
  }
  if (IS_WIN) run.tree = winTree(run.pid, winProcesses()).map(({ pid, name, created }) => ({ pid, name, created }));
  writeJson(STATE, run);
  writeJson(path.join(evidenceDir, "run.json"), run);
  const tail = stripAnsi(fs.readFileSync(path.join(evidenceDir, "dev.log"), "utf8")).split("\n").slice(-25).join("\n");
  console.error(`STARTUP FAILED: app not ready within ${READY_TIMEOUT_S}s (launcher alive: ${alive(run.pid)}).\n--- dev.log tail ---\n${tail}`);
  console.error("Run 'stop' to clean up, then report BLOCKED with the log above.");
  return 4;
}

// ---------------------------------------------------------------- exec
function parseCypress(text) {
  const t = stripAnsi(text);
  if (!t.includes("(Run Finished)")) return null;
  // Per-spec "(Results)" boxes: sum them.
  const num = (label) =>
    [...t.matchAll(new RegExp(`│\\s*${label}:\\s+(\\d+|-)`, "g"))].reduce((a, m) => a + (m[1] === "-" ? 0 : +m[1]), 0);
  // Cypress prints "(Attempt N of M) <title>" for every attempt that failed and was retried;
  // the final attempt prints normally. So any such line means the test needed a retry.
  const retried = [...new Set([...t.matchAll(/\(Attempt \d+ of \d+\)\s*(.+)/g)].map((m) => m[1].trim()))];
  return { tests: num("Tests"), passing: num("Passing"), failing: num("Failing"), pending: num("Pending"), skipped: num("Skipped"), retried };
}

function exec(name, command) {
  const run = loadRun();
  let logPath = path.join(ROOT, run.evidenceDir, `${name}.log`);
  for (let i = 2; fs.existsSync(logPath); i++) logPath = path.join(ROOT, run.evidenceDir, `${name}-${i}.log`); // keep reruns
  const log = fs.createWriteStream(logPath);
  const t0 = Date.now();
  console.log(`$ ${command}`);
  return new Promise((resolve) => {
    const child = spawn(command, { cwd: ROOT, shell: true, windowsHide: true });
    let text = "";
    const pipe = (chunk) => {
      text += chunk;
      process.stdout.write(chunk);
      log.write(stripAnsi(chunk.toString()));
    };
    child.stdout.on("data", pipe);
    child.stderr.on("data", pipe);
    child.on("close", (code) => {
      log.end();
      const entry = {
        name,
        command,
        exitCode: code,
        durationSec: Math.round((Date.now() - t0) / 1000),
        log: rel(logPath),
        cypress: parseCypress(text) || undefined,
      };
      const listPath = path.join(ROOT, run.evidenceDir, "commands.json");
      writeJson(listPath, [...readJson(listPath, []), entry]);
      console.log(`\n[rwa] ${name}: exit ${code} in ${entry.durationSec}s -> ${entry.log}`);
      if (entry.cypress?.retried.length) {
        const how = entry.cypress.failing ? "failed and was retried" : "passed only after a retry (flaky, not a clean pass)";
        console.log(`[rwa] WARNING: ${how}: ${entry.cypress.retried.join("; ")}`);
      }
      resolve(code ?? 1);
    });
  });
}

function cypress(args) {
  const dash = args.indexOf("--");
  const specs = (dash === -1 ? args : args.slice(0, dash)).map((s) => (path.isAbsolute(s) ? rel(s) : s.split(path.sep).join("/").replace(/^\.\//, "")));
  const extra = dash === -1 ? [] : args.slice(dash + 1);
  if (!specs.length) {
    console.error("Usage: rwa.mjs cypress <spec> [more specs] [-- <extra 'cypress run' args, e.g. --component>]");
    return 2;
  }
  const run = loadRun();
  const ev = run.evidenceDir;
  const PORTS = runPorts(run);
  const scratch = `${ev}/scratch/`;
  const inScratch = specs.filter((s) => s.startsWith(scratch));
  if (inScratch.length && inScratch.length !== specs.length) {
    console.error(`Run scratch specs (${scratch}) and repo specs in separate 'cypress' calls.`);
    return 2;
  }
  const name = "cypress-" + specs.map((s) => path.basename(s).replace(/\.(spec|cy)\.[jt]sx?$/, "")).join("+");
  const config = [
    `baseUrl=http://localhost:${PORTS.frontend}`,
    "video=true",
    `videosFolder=${ev}/videos`,
    `screenshotsFolder=${ev}/screenshots`,
    // Cypress empties videosFolder/screenshotsFolder before each run by default; keep everything from this verify run.
    "trashAssetsBeforeRuns=false",
  ];
  // One-off specs live in the run's scratch folder, outside the repo's specPattern.
  if (inScratch.length) config.push(`specPattern=${scratch}*`);
  // apiUrl is read by cypress.config.ts tasks (db:seed, database lookups) and by cypress/support/e2e.ts.
  const expose = `apiUrl=http://localhost:${PORTS.api}`;
  return exec(name, `yarn -s cypress run --spec "${specs.join(",")}" --config ${config.join(",")} --expose ${expose} ${extra.join(" ")}`.trim());
}

// ---------------------------------------------------------------- stop
async function stop(args) {
  const run = readJson(STATE, null);
  if (!run) {
    const PORTS = portsFor(parsePort(args) ?? DEFAULT_PORT);
    console.log("No active verify run; nothing to stop.");
    for (const [name, port] of Object.entries(PORTS)) {
      if (await portInUse(port)) console.log(`Note: port ${port} (${name}) is in use by something this skill did not start. Left alone.`);
    }
    return 0;
  }
  const PORTS = runPorts(run);
  const notes = [];
  if (IS_WIN) {
    const live = run.tree ? liveRecorded(run) : alive(run.pid) ? [{ pid: run.pid }] : [];
    for (const t of live) spawnSync("taskkill", ["/PID", String(t.pid), "/T", "/F"], { windowsHide: true });
    notes.push(live.length ? `stopped ${live.length} recorded process(es) of this run's app tree` : "this run's processes had already exited");
  } else if (runAlive(run)) {
    try {
      process.kill(-run.pid, "SIGTERM");
    } catch {}
    for (let i = 0; i < 10 && runAlive(run); i++) await sleep(500);
    try {
      process.kill(-run.pid, "SIGKILL");
    } catch {}
    notes.push(`stopped process group ${run.pid} (the app)`);
  } else {
    notes.push("this run's processes had already exited");
  }

  let busy = [];
  for (let i = 0; i < 20; i++) {
    busy = [];
    for (const [name, port] of Object.entries(PORTS)) if (await portInUse(port)) busy.push(`${port} (${name})`);
    if (!busy.length) break;
    await sleep(1000);
  }
  notes.push(busy.length ? `WARNING: still in use after stop: ${busy.join(", ")} - investigate, do not kill blindly` : `ports ${PORTS.frontend}/${PORTS.api} free`);

  const dbDirty = git("status", "--porcelain", "--", DB_FILE) !== "";
  if (dbDirty && run.dbCleanAtStart) {
    git("checkout", "--", DB_FILE);
    notes.push(`restored ${DB_FILE} (rewritten by the dev seeding)`);
  } else if (dbDirty) {
    notes.push(`left ${DB_FILE} as is: it was already modified before this run started`);
  }
  const changed = git("status", "--porcelain").split("\n").filter((l) => l && !run.dirtyAtStart.includes(l));
  notes.push(changed.length ? `files changed during the run: ${changed.join(", ")}` : "no files changed during the run");

  writeSummary(run, notes);
  fs.rmSync(STATE);
  for (const n of notes) console.log(`- ${n}`);
  console.log(`summary: ${run.evidenceDir}/summary.md`);
  return busy.length ? 6 : 0;
}

function writeSummary(run, notes) {
  const dir = path.join(ROOT, run.evidenceDir);
  const docs = readJson(path.join(dir, "doctor.json"), null);
  const cmds = readJson(path.join(dir, "commands.json"), []);
  const lines = [
    `# Verify run ${run.runId}`,
    "",
    `- Commit: \`${run.commit}\` on \`${run.branch}\`${run.dirtyAtStart.length ? ` (uncommitted at start: ${run.dirtyAtStart.join(", ")})` : " (clean)"}`,
    `- Started: ${run.startedAt} · Node ${run.node} · ${run.platform} · ports ${runPorts(run).frontend}/${runPorts(run).api}`,
    `- Doctor (last run): ${docs ? (docs.ok ? "healthy" : "UNHEALTHY") : "not run"}`,
    "",
    "| Check | Command | Exit | Time | Tests pass/fail/skip | Needed a retry |",
    "|---|---|---|---|---|---|",
    ...cmds.map((c) => {
      const cy = c.cypress;
      const tests = cy ? `${cy.passing}/${cy.failing}/${cy.pending + cy.skipped} of ${cy.tests}` : "—";
      const retried = cy ? (cy.retried.length ? cy.retried.join("; ") : "none") : "—";
      return `| ${c.name} | \`${c.command}\` | ${c.exitCode} | ${c.durationSec}s | ${tests} | ${retried} |`;
    }),
    "",
    "## Cleanup",
    ...notes.map((n) => `- ${n}`),
    "",
    "Files here: run.json, dev.log, doctor.json, commands.json, one .log per check, videos/, screenshots/ (failures only).",
    "",
  ];
  fs.writeFileSync(path.join(dir, "summary.md"), lines.join("\n"));
}

// ---------------------------------------------------------------- status
async function status(args) {
  const run = readJson(STATE, null);
  const PORTS = run ? runPorts(run) : portsFor(parsePort(args) ?? DEFAULT_PORT);
  if (run) {
    const detail = IS_WIN && run.tree ? `${liveRecorded(run).length}/${run.tree.length} recorded processes alive` : `pid ${run.pid}`;
    console.log(`active run ${run.runId} (${runAlive(run) ? "alive" : "gone"}, ${detail}), evidence ${run.evidenceDir}/`);
  } else {
    console.log("no active run");
  }
  for (const [name, port] of Object.entries(PORTS)) console.log(`port ${port} (${name}): ${(await portInUse(port)) ? "in use" : "free"}`);
  return 0;
}

// ---------------------------------------------------------------- main
// Set exitCode instead of calling process.exit(): exiting while fetch sockets are closing
// trips a libuv assertion on Windows.
const [cmd, ...rest] = process.argv.slice(2);
const usage = () => {
  console.error("Usage: rwa.mjs <start [--port N] | doctor | exec <name> -- <command...> | cypress <spec...> [-- args] | stop | status [--port N]>");
  return 2;
};
const commands = {
  start: () => start(rest),
  doctor: async () => ((await doctor(loadRun())).ok ? 0 : 5),
  exec: () => (rest.indexOf("--") === 1 && rest.length > 2 ? exec(rest[0], rest.slice(2).join(" ")) : usage()),
  cypress: () => cypress(rest),
  stop: () => stop(rest),
  status: () => status(rest),
};
process.exitCode = await (commands[cmd] || usage)();
