const puppeteer = require("puppeteer");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const semver = require("semver");
// const ava = require("ava");
const waitTime = 30000;
// const CRX_PATH = require("path").join(__dirname, "../src/");
let browser;
let page;
beforeAll(async () => {
  // const extensionPath = path.resolve(__dirname, "../dist/chrome/");
  browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-web-security",
      `--user-data-dir=data`,
      `–disable-setuid-sandbox`,
    ],
  });
});
afterAll(async () => {
  await browser.close();
});
describe("(IntegrationTest): Dom parsing script testing", () => {
  test(
    "npmjs lodash dom parse",
    async () => {
      const page = await browser.newPage();

      let url = "https://www.npmjs.com/package/lodash/";
      await page.goto(url);
      const packageName = await page.$eval("h2 span", (el) => el.innerText);
      // const packageName = titleEl.innerText;
      // //version

      // //find Version tag
      const elArray = await page.$$("h2 + span");
      expect(elArray).not.toBeNull;
      const versionParent = elArray[0];
      // console.log("versionParent", versionParent);
      // var next = versionParent.next("span");
      // console.log("next", next);
      let newV = await page.evaluate((el) => el.innerText, versionParent);
      // console.log("newV", newV);
      let version;
      let findnbsp = newV.search(String.fromCharCode(160));
      if (findnbsp >= 0) {
        newV = newV.substring(0, findnbsp);
      }
      version = newV;
      // console.log("version", version);
      // expect(version).toEqual("4.17.15");
      expect(version).not.toBeNull();
      expect(semver.valid(version));
      expect(semver.gte(version, "4.17.15"));
      expect(packageName).toBe("lodash");
      await page.close();
      //latest version is determined by this
      //npm show lodash time --json
    },
    waitTime
  );

  test(
    "parseNuget LibGit2Sharp dom parse",
    async () => {
      //Note: repeatedly getting Error: Navigation failed because browser has disconnected!
      const page = await browser.newPage();
      let url = "https://www.nuget.org/packages/LibGit2Sharp/";
      await page.goto(url, {
        waitUntil: ["load", "networkidle2"],
        timeout: waitTime,
      });
      let title = await page.$eval("title", (el) => el.innerText);
      // console.log("title", title);
      let titleElements = title
        .trim()
        .split(" ")
        .filter((el) => el != "");
      expect(titleElements).not.toBeNull();
      // console.log("titleElements", titleElements);
      let packageId = titleElements[3];
      //#skippedToContent > section > div > article > div.package-title > h1 > small
      let version = titleElements[4];
      expect(version).not.toBeNull(); //, "0.26.2");
      expect(semver.valid(version));
      expect(semver.gte(version, "0.26.2"));
      expect(packageId).toBe("LibGit2Sharp");
      await page.close();
    },
    waitTime
  );

  xtest(
    "parsePyPI Django dom parse",
    async () => {
      //disabling 6/6/20 due to timeouts in testing will come back and try to fix.
      const page = await browser.newPage();
      let url = "https://pypi.org/project/Django/";
      await page.goto(url);
      let elements = url.split("/");
      let name = elements[4];
      let versionHTML = await page.$eval(
        "h1.package-header__name",
        (el) => el.innerText
      );
      expect(versionHTML).not.toBeNull();
      // console.log("versionHTML", versionHTML);
      let versionElements = versionHTML.split(" ");
      let version = versionElements[1];
      // console.log("version", version);
      let qualifierHTML = await page.$$eval(
        "#files > table > tbody > tr > th > a",
        (el) => el[0].href
      );
      expect(qualifierHTML).not.toBeNull();
      qualifierHTML = qualifierHTML.split("/")[
        qualifierHTML.split("/").length - 1
      ];
      // console.log("qualifierHTML", qualifierHTML);
      let name_ver = `${name}-${version}-`;
      let qualifier = qualifierHTML.substr(
        name_ver.length,
        qualifierHTML.lastIndexOf(".") - name_ver.length
      );
      // console.log("qualifier", qualifier);
      let extension = qualifierHTML.substring(
        qualifierHTML.lastIndexOf(".") + 1
      );

      // console.log("extension", extension);
      expect(version).not.toBeNull();
      expect(semver.valid(version));
      expect(semver.gte(version, "3.0.7"));
      // expect(version).toEqual("3.0.7"); //3.0.7
      expect(name).toEqual("Django");
      //https://files.pythonhosted.org/packages/c6/b7/63d23df1e311ca0d90f41352a9efe7389ba353df95deea5676652e615420/Django-3.0.3-py3-none-any.whl
      expect(qualifier).toBe("py3-none-any");
      expect(extension).toBe("whl");
      await page.close();
      //latest version is determined by this
    },
    waitTime
  );

  test(
    "parseRuby bundler dom parse",
    async () => {
      //disabling 6/6/20 due to timeouts in testing will come back and try to fix.

      //https://rubygems.org/gems/bundler
      // https://rubygems.org/gems/omniauth/

      const page = await browser.newPage();
      let url = "https://rubygems.org/gems/bundler";
      await page.goto(url);
      let elements = url.split("/");
      let name = elements[4];
      let versionHTML = await page.$eval(
        "i.page__subheading",
        (el) => el.innerText
      );
      expect(versionHTML).not.toBeNull();
      // console.log("versionHTML", versionHTML);
      let version = versionHTML;
      // console.log("version", version);
      expect(version).not.toBeNull();
      expect(semver.valid(version));
      expect(semver.gte(version, "2.1.4"));
      expect(name).toBe("bundler");
      await page.close();
    },
    waitTime
  );

  xtest(
    "parsePackagist drupal dom parse",
    async () => {
      //server is packagist, format is composer
      //https://packagist.org/packages/drupal/drupal

      const page = await browser.newPage();
      let url = "https://packagist.org/packages/drupal/drupal";
      await page.goto(url);
      let elements = url.split("/");
      var namePt1 = elements[4];
      var namePt2 = elements[5];
      let name = namePt1 + "/" + namePt2;
      let versionHTML = await page.$eval(
        "span.version-number",
        (el) => el.innerText
      );
      expect(versionHTML).not.toBeNull();
      // console.log("versionHTML:", versionHTML);
      let version = versionHTML.trim();
      expect(version).not.toBeNull();
      expect(semver.valid(version));
      expect(semver.gte(version, "8.8.1"));
      expect(name).toBe("drupal/drupal");
      await page.close();
    },
    waitTime
  );

  test(
    "parseCocoaPods TestFairy dom parse",
    async () => {
      //https://cocoapods.org/pods/TestFairy

      const page = await browser.newPage();
      let url = "https://cocoapods.org/pods/TestFairy";
      const response = await page.goto(url);
      // console.log("response", response.headers.status);
      if (response.headers.status != 200) {
        //this page goes done a bit, so just return true, not what I am testing :)
        expect(true);
        return;
      }
      let elements = url.split("/");
      let name = elements[4];
      let versionHTML = await page.$eval("H1 span", (el) => el.innerText);
      expect(versionHTML).not.toBeNull();
      // console.log("versionHTML:", versionHTML);
      let version = versionHTML.trim();
      expect(version).not.toBeNull();
      expect(semver.valid(version));
      expect(semver.gte(version, "1.22.0"));
      expect(name).toEqual("TestFairy");
      await page.close();
    },
    waitTime
  );

  test(
    "parseCRAN clustcurv dom parse",
    async () => {
      // https://cran.r-project.org/package=clustcurv

      const page = await browser.newPage();
      let url = "https://cran.r-project.org/package=clustcurv";
      await page.goto(url);
      let elements = url.split("/");

      let nameHTML = await page.$eval("h2", (el) => el.innerText);
      let name = nameHTML.split(":")[0];
      let versionHTML = await page.$eval(
        "table tr:nth-child(1) td:nth-child(2)",
        (el) => el.innerText
      );
      expect(versionHTML).not.toBeNull();
      // console.log("versionHTML:", versionHTML);
      let version = versionHTML.trim();
      expect(version).not.toBeNull();
      expect(semver.valid(version));
      expect(semver.gte(version, "1.0.0"));
      expect(name).toEqual("clustcurv");
      await page.close();
    },
    waitTime
  );

  xtest(
    "parseGoLang github.com/etcd-io/etcd dom parse",
    async () => {
      //7/2/20 - could not get it to work for GoCenter, keeps disconnecting
      const page = await browser.newPage();
      // let url = "https://search.gocenter.io/github.com~2Fetcd-io~2Fetcd/versions";
      let url = "https://search.gocenter.io/github.com/go-gitea/gitea";
      https: await page.goto(url, {
        waitUntil: ["load", "networkidle2"],
        timeout: waitTime,
      });
      await page.waitForSelector("span.version-name", {
        visible: true,
      });
      let type, namespace, name;
      let elements = url.split("/");
      if (url.search("search.gocenter.io") >= 0) {
        //has packagename in 5
        let fullname = elements[3];
        //"github.com~2Fhansrodtang~2Frandomcolor"
        let nameElements = fullname.split("~2F");
        // 0: "github.com"
        // 1: "hansrodtang"
        // 2: "randomcolor"
        type = nameElements[0]; //"github.com";
        namespace = nameElements[1];
        name = nameElements[2];
      }
      name = `${type}/${namespace}/${name}`;
      let versionHTMLElement;

      let elArray = await page.$$("span.version-name");
      const versionElement = elArray[0];
      let version = await page.evaluate((el) => el.innerText, versionElement);

      expect(version).not.toBeNull();
      // "v3.4.2+incompatible");
      expect(name).toEqual("github.com/etcd-io/etcd");
      await page.close();
    },
    waitTime
  );

  xtest(
    "parseCrates rand dom parse",
    async () => {
      // Error: Protocol error (Runtime.callFunctionOn): Target closed.
      //due to loading using ajax
      const page = await browser.newPage();
      let url = "https://crates.io/crates/rand";
      let elements = url.split("/");
      let name = elements[4];

      await page.goto(url, {
        waitUntil: ["load", "networkidle2"],
        timeout: waitTime,
      });
      await page.waitForSelector("div.info h2", {
        visible: true,
      });
      let elArray = await page.$$("div.info h2");
      expect(elArray).not.toBeNull();
      const versionElement = elArray[0];
      // console.log("versionParent", versionParent);
      // var next = versionParent.next("span");
      // console.log("next", next);
      let version = await page.evaluate((el) => el.innerText, versionElement);
      // console.log("versionElement", versionElement);
      // let version = versionHTML.trim();
      expect(version).not.toBeNull();
      expect(semver.valid(version));
      expect(semver.gte(version, "0.7.3"));
      expect(name).toEqual("rand");

      await page.close();
    },
    waitTime
  );

  xtest("parseNexusRepo commons collections  dom parse", async () => {
    const page = await browser.newPage();
    let url =
      "http://nexus:8081/#browse/browse:maven-central:commons-collections%2Fcommons-collections%2F3.2.1";
    //https://ec.europa.eu/cefdigital/artifact/#browse/browse:public:commons-collections%2Fcommons-collections%2F3.2%2Fcommons-collections-3.2.jar
    await page.goto(url);
    // await page.waitFor(1000);
    let elements = url.split("/");
    let type, namespace, name;
    if (url.search("search.gocenter.io") >= 0) {
      //has packagename in 5
      let fullname = elements[3];
      //"github.com~2Fhansrodtang~2Frandomcolor"
      let nameElements = fullname.split("~2F");
      // 0: "github.com"
      // 1: "hansrodtang"
      // 2: "randomcolor"
      type = "github.com";
      namespace = nameElements[1];
      name = nameElements[2];
    }
    let versionHTMLElement;
    if (elements[4] == "versions") {
      //last element in array is versions
      //then we parse for latest version in the document
      //e.g. https://search.gocenter.io/github.com~2Fetcd-io~2Fetcd/versions

      versionHTMLElement = await page.$$("span.version-name");
      // console.log("if versionHTMLElement", versionHTMLElement);
    } else {
      //e.g., https://search.gocenter.io/github.com~2Fgo-gitea~2Fgitea/info?version=v1.5.1
      versionHTMLElement = await page.$$eval(
        "#select-header > span > span.ui-select-match-text.pull-left",
        (el) => el[0].innerText
      );
      // console.log("else versionHTMLElement", versionHTMLElement);
    }
    let versionHTML = versionHTMLElement[0].innerText;
    // console.log("versionHTML:", versionHTML);
    let version = versionHTML.trim();
    assert.equal(version, "v3.4.2+incompatible");
    assert.equal(name, "github.com/etcd-io/etcd");
    assert(version != null);
  });
});
