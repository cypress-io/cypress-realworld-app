import { Page } from "@playwright/test";

/**
 * Check if current viewport is mobile
 */
export function isMobile(page: Page): boolean {
  const viewport = page.viewportSize();
  const mobileBreakpoint = 414; // From Cypress config
  return viewport ? viewport.width < mobileBreakpoint : false;
}
