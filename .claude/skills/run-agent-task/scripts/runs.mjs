#!/usr/bin/env node
// Helper for the run-agent-task skill: intake, ownership, run records and the scorecard.
//
//   pick                     find the oldest qualifying agent-ready issue (read-only)
//   claim <issue>            re-check it, create a run record, label it and post the ownership record
//   ports                    print a free port base for a new worktree
//   agent <run> <role> <round> <minutes> <tokens|null> <tool_calls|null> [verdict]
//   set <run> <key> <json>   set a top-level field (for example reviewed_sha, acceptance, ci)
//   note <run> <intervention|blocker|lead_mistake|defect> <text>
//   finish <run> (--pr <url> | --blocked <reason>)
//   review-time <run> <minutes>   for the human: record how long the review took
//   report <run>             print the run report
//   scorecard                print and write .agent-runs/SCORECARD.md
//
// Run records live in <main checkout>/.agent-runs/<run-id>/run.json (gitignored).
// Unknown values stay null. Nothing here guesses a number.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

const READY = "agent-ready";
const BUSY_LABELS = ["agent-in-progress", "agent-pr-open", "agent-blocked"];
const REQUIRED_SECTIONS = ["Why", "Scope", "Acceptance criteria", "Base branch"];
const PORT_BASES = [3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900];

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  }).trim();
}
const git = (...args) => sh("git", args);
const ghJson = (...args) => JSON.parse(sh("gh", ["api", ...args]) || "null");
// REST only: `gh issue edit` and `gh pr edit` break on older gh versions (Projects classic deprecation).
function ghSend(method, endpoint, payload) {
  return execFileSync("gh", ["api", "-X", method, endpoint, "--input", "-"], {
    encoding: "utf8",
    input: JSON.stringify(payload ?? {}),
    stdio: ["pipe", "pipe", "pipe"],
  });
}
const addLabel = (slug, n, name) =>
  ghSend("POST", `repos/${slug}/issues/${n}/labels`, { labels: [name] });
const comment = (slug, n, body) => ghSend("POST", `repos/${slug}/issues/${n}/comments`, { body });
function removeLabel(slug, n, name) {
  try {
    sh("gh", [
      "api",
      "-X",
      "DELETE",
      `repos/${slug}/issues/${n}/labels/${encodeURIComponent(name)}`,
    ]);
  } catch {
    // The label wasn't on the issue.
  }
}

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exitCode = 1;
  return null;
}

// The main checkout owns .agent-runs, even when called from a worktree.
const COMMON_DIR = git("rev-parse", "--path-format=absolute", "--git-common-dir");
const MAIN_ROOT = path.dirname(COMMON_DIR);
const RUNS_DIR = path.join(MAIN_ROOT, ".agent-runs");

function repoSlug() {
  const url = git("remote", "get-url", "origin");
  const m = url.match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/);
  if (!m) throw new Error(`origin is not a GitHub URL: ${url}`);
  return `${m[1]}/${m[2]}`;
}

function sections(body) {
  // Issue forms render each field as "### <label>\n\n<value>".
  const out = {};
  const parts = (body || "").split(/^###\s+/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const title = (nl === -1 ? part : part.slice(0, nl)).trim();
    const value = (nl === -1 ? "" : part.slice(nl + 1)).trim();
    out[title] = value === "_No response_" ? "" : value;
  }
  if (out["Base branch"]) out["Base branch"] = out["Base branch"].replace(/`/g, "").trim();
  return out;
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/^\[agent\]\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

function remoteBranchExists(name) {
  return git("ls-remote", "--heads", "origin", name) !== "";
}

function openRuns() {
  if (!fs.existsSync(RUNS_DIR)) return [];
  return fs
    .readdirSync(RUNS_DIR)
    .map((d) => path.join(RUNS_DIR, d, "run.json"))
    .filter((f) => fs.existsSync(f))
    .map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
}

function why(issue, slug, prs) {
  const n = issue.number;
  const labels = issue.labels.map((l) => l.name);
  const busy = labels.find((l) => BUSY_LABELS.includes(l));
  if (busy) return `has label ${busy}`;
  if (issue.assignees?.length)
    return `assigned to ${issue.assignees.map((a) => a.login).join(", ")}`;
  const ref = new RegExp(`#${n}\\b`);
  const pr = prs.find(
    (p) => p.head.ref.startsWith(`agent/issue-${n}-`) || ref.test(`${p.title}\n${p.body || ""}`)
  );
  if (pr) return `linked open PR #${pr.number}`;
  if (git("ls-remote", "--heads", "origin", `agent/issue-${n}-*`))
    return "an agent/issue branch already exists on origin";
  if (git("branch", "--list", `agent/issue-${n}-*`))
    return "an agent/issue branch already exists locally";
  if (openRuns().some((r) => r.issue?.number === n && !r.finished_at))
    return "an unfinished local run owns it";
  const s = sections(issue.body);
  const missing = REQUIRED_SECTIONS.filter((t) => !s[t]);
  if (missing.length) return `missing or empty section(s): ${missing.join(", ")}`;
  if (!remoteBranchExists(s["Base branch"]))
    return `base branch "${s["Base branch"]}" is not on origin`;
  return null;
}

function candidates() {
  const slug = repoSlug();
  const issues = ghJson(
    `repos/${slug}/issues?state=open&labels=${READY}&sort=created&direction=asc&per_page=50`
  ).filter((i) => !i.pull_request);
  const prs = ghJson(`repos/${slug}/pulls?state=open&per_page=100`);
  return { slug, issues, prs };
}

function pick() {
  const { slug, issues, prs } = candidates();
  const skipped = [];
  for (const issue of issues) {
    const reason = why(issue, slug, prs);
    if (reason) {
      skipped.push({ number: issue.number, title: issue.title, reason });
      continue;
    }
    const s = sections(issue.body);
    return {
      picked: {
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        base: s["Base branch"],
      },
      skipped,
    };
  }
  return { picked: null, skipped };
}

function canConnect(port, host) {
  return new Promise((resolve) => {
    const sock = net.connect({ port, host });
    sock.setTimeout(500);
    sock.once("connect", () => (sock.destroy(), resolve(true)));
    sock.once("timeout", () => (sock.destroy(), resolve(false)));
    sock.once("error", () => resolve(false));
  });
}

async function portInUse(port) {
  return (await canConnect(port, "127.0.0.1")) || (await canConnect(port, "::1"));
}

async function freePortBase() {
  const claimed = new Set(
    openRuns()
      .filter((r) => !r.finished_at)
      .map((r) => r.ports?.frontend)
  );
  for (const base of PORT_BASES) {
    if (claimed.has(base)) continue;
    if (!(await portInUse(base)) && !(await portInUse(base + 1))) return base;
  }
  return null;
}

function runPath(id) {
  const p = path.join(RUNS_DIR, id, "run.json");
  if (!fs.existsSync(p)) throw new Error(`no run record ${p}`);
  return p;
}
const load = (id) => JSON.parse(fs.readFileSync(runPath(id), "utf8"));
const save = (r) =>
  fs.writeFileSync(path.join(RUNS_DIR, r.run_id, "run.json"), JSON.stringify(r, null, 2) + "\n");

function parseValue(v) {
  if (v === "null") return null;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

async function claim(number) {
  const { slug, issues, prs } = candidates();
  const issue = issues.find((i) => i.number === number);
  if (!issue) return fail(`issue #${number} is not open with label ${READY}`);
  const reason = why(issue, slug, prs);
  if (reason) return fail(`issue #${number} doesn't qualify: ${reason}`);
  const base = sections(issue.body)["Base branch"];
  const ports = await freePortBase();
  if (!ports) return fail("no free port base between 3100 and 3900");

  const run_id = `${stamp()}-issue-${number}`;
  const branch = `agent/issue-${number}-${slugify(issue.title)}`;
  const worktree = path.join(path.dirname(MAIN_ROOT), `wt-issue-${number}`);
  const record = {
    run_id,
    task: issue.title.replace(/^\[agent\]\s*/, ""),
    source: "pipeline",
    issue: { number, url: issue.html_url },
    pr: null,
    base,
    branch,
    worktree,
    ports: { frontend: ports, api: ports + 1 },
    started_at: new Date().toISOString(),
    finished_at: null,
    wall_clock_min: null,
    verdict: null,
    reviewed_sha: null,
    head_sha: null,
    correction_rounds: 0,
    acceptance: { total: null, met: null },
    agents: [],
    human_interventions: [],
    human_review_min: null,
    defects_caught_by_review: [],
    lead_mistakes_caught: [],
    blockers: [],
    ci: null,
    evidence: [],
    usage_note:
      "tokens = the final context size each agent reported, not billed usage. The orchestrating session isn't counted.",
  };
  fs.mkdirSync(path.join(RUNS_DIR, run_id), { recursive: true });
  save(record);

  addLabel(slug, number, "agent-in-progress");
  const body = [
    `**Agent run \`${run_id}\` owns this issue.**`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Branch | \`${branch}\` (from \`${base}\`) |`,
    `| Worktree | \`${path.basename(worktree)}\` |`,
    `| Ports | ${ports} / ${ports + 1} |`,
    `| Started | ${record.started_at} |`,
    "",
    "The run opens a draft PR or records a blocker. It stops after two failed review rounds. Merge authority: human.",
  ].join("\n");
  comment(slug, number, body);
  console.log(JSON.stringify(record, null, 2));
}

function finish(id, flag, value) {
  const r = load(id);
  const slug = repoSlug();
  r.finished_at = new Date().toISOString();
  r.wall_clock_min =
    Math.round(((new Date(r.finished_at) - new Date(r.started_at)) / 60000) * 10) / 10;
  let body;
  if (flag === "--pr") {
    r.pr = value;
    body = [
      `**Agent run \`${id}\` finished: draft PR ${value}**`,
      "",
      `Verdict **${r.verdict ?? "null"}** on \`${r.reviewed_sha ?? "null"}\`, after ${r.correction_rounds} correction round(s).`,
      "Waiting for human review. Nothing was merged.",
    ].join("\n");
    if (r.issue) {
      removeLabel(slug, r.issue.number, "agent-in-progress");
      addLabel(slug, r.issue.number, "agent-pr-open");
    }
  } else if (flag === "--blocked") {
    r.blockers.push(value);
    r.verdict = r.verdict ?? "BLOCKED";
    body = [
      `**Agent run \`${id}\` stopped without a PR.**`,
      "",
      `Blocker: ${value}`,
      "",
      "A human needs to decide the next step.",
    ].join("\n");
    if (r.issue) {
      removeLabel(slug, r.issue.number, "agent-in-progress");
      addLabel(slug, r.issue.number, "agent-blocked");
    }
  } else {
    return fail("finish needs --pr <url> or --blocked <reason>");
  }
  if (r.issue) comment(slug, r.issue.number, body);
  save(r);
  console.log(`finished ${id}: ${r.wall_clock_min} min, verdict ${r.verdict}`);
}

const fmt = (v) => (v === null || v === undefined ? "null" : v);
const sum = (xs) =>
  xs.some((x) => x === null || x === undefined) || !xs.length
    ? null
    : xs.reduce((a, b) => a + b, 0);
const round1 = (x) => (x === null ? null : Math.round(x * 10) / 10);

function report(id) {
  const r = load(id);
  const lines = [
    `# Run ${r.run_id}: ${r.task}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Issue | ${fmt(r.issue?.url)} |`,
    `| PR | ${fmt(r.pr)} |`,
    `| Branch | \`${r.branch}\` from \`${r.base}\` |`,
    `| Reviewed commit | ${fmt(r.reviewed_sha)} (head ${fmt(r.head_sha)}) |`,
    `| Verdict | ${fmt(r.verdict)} |`,
    `| Acceptance criteria met | ${fmt(r.acceptance.met)} of ${fmt(r.acceptance.total)} |`,
    `| Correction rounds | ${r.correction_rounds} |`,
    `| Wall clock | ${fmt(r.wall_clock_min)} min |`,
    `| Human interventions | ${r.human_interventions.length}${r.human_interventions.length ? ": " + r.human_interventions.join("; ") : ""} |`,
    `| Human review time | ${fmt(r.human_review_min)} min |`,
    `| CI | ${r.ci ? `${r.ci.check}: ${r.ci.conclusion}` : "null"} |`,
    `| Unresolved blockers | ${r.blockers.length ? r.blockers.join("; ") : "none"} |`,
    "",
    "| Agent | Round | Minutes | Tokens | Tool calls | Verdict |",
    "|---|---|---|---|---|---|",
    ...r.agents.map(
      (a) =>
        `| ${a.role} | ${a.round} | ${fmt(a.minutes)} | ${fmt(a.tokens)} | ${fmt(a.tool_calls)} | ${fmt(a.verdict)} |`
    ),
    "",
    `Defects caught by review: ${r.defects_caught_by_review.length ? r.defects_caught_by_review.map((d) => `\n- ${d}`).join("") : "none"}`,
    `Lead mistakes caught by agents: ${r.lead_mistakes_caught.length ? r.lead_mistakes_caught.map((d) => `\n- ${d}`).join("") : "none"}`,
    `Evidence: ${r.evidence.length ? r.evidence.join(", ") : "null"}`,
    "",
    `_${r.usage_note}_`,
  ];
  console.log(lines.join("\n"));
}

function scorecard() {
  const runs = openRuns().sort((a, b) => a.started_at.localeCompare(b.started_at));
  const rows = runs.map((r) => {
    const agentMin = round1(sum(r.agents.map((a) => a.minutes)));
    return [
      r.run_id,
      r.task,
      r.source,
      fmt(r.verdict),
      r.correction_rounds,
      r.acceptance.total === null ? "null" : `${fmt(r.acceptance.met)}/${r.acceptance.total}`,
      fmt(r.wall_clock_min),
      fmt(agentMin),
      r.human_interventions.length,
      fmt(r.human_review_min),
      r.defects_caught_by_review.length,
      r.lead_mistakes_caught.length,
    ];
  });
  const head = [
    "Run",
    "Task",
    "Source",
    "Verdict",
    "Rounds",
    "ACs",
    "Wall min",
    "Agent min",
    "Human interventions",
    "Review min",
    "Defects caught",
    "Lead mistakes caught",
  ];
  const passed = runs.filter((r) => r.verdict === "PASS").length;
  const reviewed = runs.filter((r) => r.human_review_min !== null);
  const out = [
    "# Agent run scorecard",
    "",
    `Generated ${new Date().toISOString()} from ${runs.length} run record(s) in \`.agent-runs/\`.`,
    "",
    `| ${head.join(" | ")} |`,
    `|${head.map(() => "---").join("|")}|`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    "",
    "| Total | Value |",
    "|---|---|",
    `| Runs that reached PASS | ${passed} of ${runs.length} |`,
    `| First-round PASS | ${runs.filter((r) => r.verdict === "PASS" && r.correction_rounds === 0).length} of ${runs.length} |`,
    `| Correction rounds | ${runs.reduce((a, r) => a + r.correction_rounds, 0)} |`,
    `| Defects caught by review | ${runs.reduce((a, r) => a + r.defects_caught_by_review.length, 0)} |`,
    `| Human interventions | ${runs.reduce((a, r) => a + r.human_interventions.length, 0)} |`,
    `| Human review time recorded | ${reviewed.length} of ${runs.length} runs${reviewed.length ? `, ${reviewed.reduce((a, r) => a + r.human_review_min, 0)} min total` : ""} |`,
    "",
    "`null` means the value wasn't recorded. Agent minutes are null when any agent's time is unknown.",
  ];
  const text = out.join("\n") + "\n";
  fs.mkdirSync(RUNS_DIR, { recursive: true });
  fs.writeFileSync(path.join(RUNS_DIR, "SCORECARD.md"), text);
  console.log(text);
}

async function main() {
  const [cmd, ...a] = process.argv.slice(2);
  switch (cmd) {
    case "pick":
      return console.log(JSON.stringify(pick(), null, 2));
    case "claim":
      return claim(Number(a[0]));
    case "ports": {
      const base = await freePortBase();
      return base ? console.log(base) : fail("no free port base between 3100 and 3900");
    }
    case "agent": {
      const [id, role, rnd, minutes, tokens, tools, verdict] = a;
      const r = load(id);
      r.agents.push({
        role,
        round: Number(rnd),
        minutes: parseValue(minutes),
        tokens: parseValue(tokens),
        tool_calls: parseValue(tools),
        verdict: verdict ? verdict : null,
      });
      return save(r);
    }
    case "set": {
      const [id, key, value] = a;
      const r = load(id);
      r[key] = parseValue(value);
      return save(r);
    }
    case "note": {
      const [id, kind, ...text] = a;
      const field = {
        intervention: "human_interventions",
        blocker: "blockers",
        lead_mistake: "lead_mistakes_caught",
        defect: "defects_caught_by_review",
      }[kind];
      if (!field) return fail("note kind must be intervention, blocker, lead_mistake or defect");
      const r = load(id);
      r[field].push(text.join(" "));
      return save(r);
    }
    case "finish":
      return finish(a[0], a[1], a.slice(2).join(" "));
    case "review-time": {
      const r = load(a[0]);
      r.human_review_min = Number(a[1]);
      save(r);
      return console.log(`recorded ${a[1]} min of human review for ${a[0]}`);
    }
    case "report":
      return report(a[0]);
    case "scorecard":
      return scorecard();
    default:
      console.log(
        "usage: runs.mjs pick | claim <issue> | ports | agent | set | note | finish | review-time | report | scorecard"
      );
      if (cmd) process.exitCode = 1;
  }
}

main().catch((e) => fail(e.message));
