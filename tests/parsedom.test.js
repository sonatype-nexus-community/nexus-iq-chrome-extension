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

test("npmjs lodash dom parse", async () => {
  try {
    const page = await browser.newPage();

    let url = "https://www.npmjs.com/package/lodash/";
    await page.goto(url);
    const titleEl = await page.$("h2 span");
    const packageName = titleEl.innerText;
    // //version

    // //find Version tag
    const elArray = await page.$$("h2 + span");
    const versionParent = elArray[0];
    console.log("versionParent", versionParent);
    // var next = versionParent.next("span");
    // console.log("next", next);
    let newV = await page.evaluate(el => el.innerText, versionParent);
    console.log("newV", newV);
    let version;
    let findnbsp = newV.search(String.fromCharCode(160));
    if (findnbsp >= 0) {
      newV = newV.substring(0, findnbsp);
    }
    version = newV;
    console.log("version", version);
    assert.equal(packageName, "lodash");
    assert(version != null);
    //latest version is determined by this
    //npm show lodash time --json
  } catch (err) {
    // console.log("err", err);
  } finally {
    // await browser.close();
  }
});
