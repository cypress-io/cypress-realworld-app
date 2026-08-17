import { Response } from "express";

/**
 * DEMO BREAK helpers — intentional unreliability for Cypress Cloud demos.
 * Disable by setting DEMO_BREAK=false (or removing it) in .env to restore the working API.
 */
export const isDemoBreak = () => process.env.DEMO_BREAK === "true";

/** Returns true if the response was already sent as a chaos failure (caller should return). */
export function maybeChaosFail(
  res: Response,
  {
    successRate = 0.3,
    status = 503,
    error = "ServiceUnavailable",
    message = "Simulated intermittent server failure (DEMO_BREAK)",
  }: {
    successRate?: number;
    status?: number;
    error?: string;
    message?: string;
  } = {}
): boolean {
  if (!isDemoBreak()) {
    return false;
  }

  if (Math.random() < successRate) {
    return false;
  }

  res.status(status).json({ error, message, demoBreak: true });
  return true;
}

/** Occasionally delays before continuing; useful for request/command timeouts. */
export function maybeChaosDelay(
  delayMs = 10000,
  probability = 0.35
): Promise<void> {
  if (!isDemoBreak() || Math.random() >= probability) {
    return Promise.resolve();
  }

  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
