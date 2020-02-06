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
    // return;
    await page.goto(url);
    const titleEl = await page.$("h2 span");
    const title = await page.evaluate(el => el.innerText, titleEl);
    console.log("title", title);

    //version
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
    assert.equal(title, "lodash");
    assert(version != null);
    //latest version is determined by this
    //npm show lodash time --json
  } catch (err) {
    console.log("err", err);
  } finally {
    // await browser.close();
  }
  return;
  //found = $("h2 span");
  // let found;
  // let newV;
  // let elements;
  // let packageName;
  // let version;
  // // found = await page.evaluate(
  // //   () => document.querySelector("h2 span").innerText
  // // );
  // found = await page.$("h2 span");
  // console.log("found", found);
  // packageName = found.text().trim();
  // newV = page.$("h2").next("span");
  // if (typeof newV !== "undefined" && newV !== "") {
  //   newV = newV.text();
  //   //produces "24.5.0 • "
  //   let findnbsp = newV.search(String.fromCharCode(160));
  //   if (findnbsp >= 0) {
  //     newV = newV.substring(0, findnbsp);
  //   }
  //   version = newV;
  //   console.log("packageName, version", packageName, version);
  // } else {
  //   console.log("Dom changed");
  // }
  await browser.close();
});

// await page.setRequestInterception(true);
// page.on("request", async request => {
//   if (request.url().endsWith("/api/backendcall")) {
//     await request.respond({
//       status: 200,
//       contentType: "application/json",
//       body: JSON.stringify({ key: "value" })
//     });
//   } else {
//     await request.continue();
//   }
// });
