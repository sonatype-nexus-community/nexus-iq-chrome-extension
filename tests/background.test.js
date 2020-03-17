const puppeteer = require("puppeteer");
const CRX_PATH = require("path").join(__dirname, "../src/");
const assert = require("assert");
const fs = require("fs");
// const CRX_PATH = require("path").join(__dirname, "../src/");
var browser;
beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`
    ],
    slowMo: 0 // slow
  });
});
afterAll(async () => {
  await browser.close();
});
describe.skip("testing the Background page", () => {
  test("Background Page", async () => {
    const targets = await browser.targets();
    const backgroundPageTarget = targets.find(
      target => target.type() === "background_page"
    );
    const backgroundPage = await backgroundPageTarget.page();
    // Test the background page as you would any other page.

    //how to write a test of the bg page?
    // Can we navigate to a chrome-extension page? YES!
  }, 5000);
});
