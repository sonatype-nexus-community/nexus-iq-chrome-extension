const puppeteer = require("puppeteer");
const fs = require("fs");
// const CRX_PATH = require("path").join(__dirname, "../src/");
(async () => {
  var browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-web-security", `--user-data-dir=data`]
    });
    const page = await browser.newPage();

    let url = "https://www.npmjs.com/package/lodash/";
    // return;
    await page.goto(url);
    // get local jQuery
    var jquery_code_str = fs.readFileSync(
      "src/Scripts/lib/jquery.min.js",
      "utf8"
    );

    // go to page

    // inject jQuery
    var jquery_ev_fn = await page.evaluate(function(code_str) {
      return code_str;
    }, jquery_code_str);
    await page.evaluate(jquery_ev_fn);

    const title = await page.evaluate(() => {
      const $ = window.$; //otherwise the transpiler will rename it and won't work
      console.log("H2", $("h2 span").text());
    });
    // (await page.$("#hs-eu-confirmation-button")).click();
    // let actual = parseNPMURL(url);
    await page.screenshot({ path: "example.png" });
  } catch (err) {
    console.log("err", err);
  } finally {
    await browser.close();
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
})();

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
