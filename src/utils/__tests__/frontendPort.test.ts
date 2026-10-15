import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import createViteConfig from "../../../vite.config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("frontend port configuration", () => {
  it.each(["3000", "43000"])("uses PORT=%s for the dev server", (port) => {
    vi.stubEnv("PORT", port);

    const config = createViteConfig({ command: "serve", mode: "development" });

    expect(config.server?.port).toBe(Number(port));
  });

  it.each([
    ["3000", "3001"],
    ["43000", "43001"],
  ])("waits for the configured frontend %s and API %s", (port, backendPort) => {
    const output = execFileSync(
      process.execPath,
      ["-p", "JSON.stringify(require('./scripts/wait-on.config.js'))"],
      { env: { ...process.env, PORT: port, VITE_BACKEND_PORT: backendPort } }
    );

    expect(JSON.parse(output.toString())).toEqual({
      resources: [`http://localhost:${port}`, `http://localhost:${backendPort}`],
      timeout: 60000,
    });
  });
});
