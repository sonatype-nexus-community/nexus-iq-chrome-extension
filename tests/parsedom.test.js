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
  const page = await browser.newPage();

  let url = "https://www.npmjs.com/package/lodash/";
  await page.goto(url);
  const packageName = await page.$eval("h2 span", el => el.innerText);
  // const packageName = titleEl.innerText;
  // //version

  // //find Version tag
  const elArray = await page.$$("h2 + span");
  const versionParent = elArray[0];
  // console.log("versionParent", versionParent);
  // var next = versionParent.next("span");
  // console.log("next", next);
  let newV = await page.evaluate(el => el.innerText, versionParent);
  // console.log("newV", newV);
  let version;
  let findnbsp = newV.search(String.fromCharCode(160));
  if (findnbsp >= 0) {
    newV = newV.substring(0, findnbsp);
  }
  version = newV;
  // console.log("version", version);
  // expect(version).toEqual("4.17.16");
  assert.equal(version, "4.17.15");
  assert.equal(packageName, "lodash");
  assert(version != null);
  //latest version is determined by this
  //npm show lodash time --json
});

test("parseNuget LibGit2Sharp dom parse", async () => {
  const page = await browser.newPage();

  let url = "https://www.nuget.org/packages/LibGit2Sharp/";
  await page.goto(url);
  let title = await page.$eval("title", el => el.innerText);
  // console.log("title", title);
  let titleElements = title
    .trim()
    .split(" ")
    .filter(el => el != "");

  console.log("titleElements", titleElements);
  let packageId = titleElements[3];
  //#skippedToContent > section > div > article > div.package-title > h1 > small
  let version = titleElements[4];

  assert.equal(version, "0.26.2");
  assert.equal(packageId, "LibGit2Sharp");
  assert(version != null);
  //latest version is determined by this
  //npm show lodash time --json
});

test("parsePyPI Django dom parse", async () => {
  const page = await browser.newPage();
  let url = "https://pypi.org/project/Django/";
  await page.goto(url);
  let elements = url.split("/");
  let name = elements[4];
  let versionHTML = await page.$eval(
    "h1.package-header__name",
    el => el.innerText
  );

  console.log("versionHTML", versionHTML);
  let versionElements = versionHTML.split(" ");
  let version = versionElements[1];
  console.log("version", version);
  let qualifierHTML = await page.$$eval(
    "#files > table > tbody > tr > th > a",
    el => el[0].href
  );
  qualifierHTML = qualifierHTML.split("/")[qualifierHTML.split("/").length - 1];
  console.log("qualifierHTML", qualifierHTML);
  let name_ver = `${name}-${version}-`;
  qualifier = qualifierHTML.substr(
    name_ver.length,
    qualifierHTML.lastIndexOf(".") - name_ver.length
  );
  console.log("qualifier", qualifier);
  let extension = qualifierHTML.substring(qualifierHTML.lastIndexOf(".") + 1);

  console.log("extension", extension);
  assert.equal(version, "3.0.3");
  assert.equal(name, "Django");
  assert(version != null);
  //https://files.pythonhosted.org/packages/c6/b7/63d23df1e311ca0d90f41352a9efe7389ba353df95deea5676652e615420/Django-3.0.3-py3-none-any.whl
  assert.equal(qualifier, "py3-none-any");
  assert.equal(extension, "whl");
  //latest version is determined by this
  //npm show lodash time --json
});
