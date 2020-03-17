const puppeteer = require("puppeteer");
const fs = require("fs");
const CRX_PATH = require("path").join(__dirname, "../src/");
var browser;
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`
    ],
    slowMo: 25 // slow
  });
});

afterEach(async () => {
  await browser.close();
});

const urls = [
  "https://www.amazon.com",
  "https://example.com",
  "https://gov.uk",
  "https://loc.gov",
  "https://twitter.com",
  "https://wikipedia.org"
];

describe.skip("Content injection scripts", () => {
  test("Content script injection", async () => {
    const page = await browser.newPage();
    for (let url of urls) {
    }
  });
});
