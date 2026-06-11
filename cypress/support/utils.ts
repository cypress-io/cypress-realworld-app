export const isMobile = () => {
  return Cypress.config("viewportWidth") < Cypress.expose("mobileViewportWidthBreakpoint");
};
