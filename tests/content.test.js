const puppeteer = require("puppeteer");
const assert = require("assert");
const fs = require("fs");
// const CRX_PATH = require("path").join(__dirname, "../src/");
var browser;
beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-web-security", `--user-data-dir=data`]
  });
});
afterAll(async () => {
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

test("Content script injection", () => {
  for (let url of urls) {
  }
});
