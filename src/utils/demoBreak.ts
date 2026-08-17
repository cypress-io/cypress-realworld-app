/**
 * DEMO BREAK helpers — intentional UI bugs for Cypress Cloud demos.
 * Disable by setting VITE_DEMO_BREAK=false (or removing it) in .env to restore the working UI.
 */
export const isDemoBreak = () => process.env.VITE_DEMO_BREAK === "true";
