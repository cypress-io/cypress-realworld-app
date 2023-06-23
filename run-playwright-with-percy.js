const tsNode = require("ts-node");
const { chromium } = require("@playwright/test");

tsNode.register();

(async () => {
  const browser = await chromium.launch();

  tsNode.require("./playwright/__tests__/bankaccounts.test.ts");

  await browser.close();
})();
