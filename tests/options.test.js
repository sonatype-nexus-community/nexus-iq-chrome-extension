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

xtest("Options Page applications list", async () => {
  // const targets = await browser.targets();
  // const backgroundPageTarget = targets.find(
  //   target => target.type() === "background_page"
  // );
  // const backgroundPage = await backgroundPageTarget.page();
  // Test the background page as you would any other page.
  //how to write a test of the bg page?
  // Can we navigate to a chrome-extension page? YES!

  const [pages] = await browserPuppeteer.pages();
  // const page = pages[0];
  console.log("pages", pages);
  const page = await browserPuppeteer.newPage();
  // const browser = window.browser || window.chrome;
  //chrome.runtime.id;
  var extensionId = "cpcadbpgmdpfkilcmochjeamhmficgkc";
  console.log("extensionId", extensionId);
  await page.goto(`chrome-extension://${extensionId}/html/options.html`);
  // await page.goto(`${CRX_PATH}/html/options.html`);
  // click buttons, test UI elements, etc.
  //click login
  //enter the address - URL, username, password, appId
  // let url = page.$("#URL");
  // url.html("http://localhost:8070/");
  // let username = page.$("#username");
  // username.html("admin");
  // let password = page.$("#password");
  // password.html("admin123");

  // const [response] = await Promise.all([
  //   page.waitForNavigation(),
  //   page.click("#Login")
  // ]);
  await page.type("#url", "http://iq-server:8070/");
  await page.type("#username", "admin");
  await page.type("#password", "admin123");

  await page.click("#login");

  await page.waitForNavigation({ waitUntil: "load" });

  let appId = page.$("#appId");
  console.log("appId:", appId.length);
  const numElements = appId.length;
  expect(numElements).toEqual(68);
  //appId should have items
  // await page.close();
});

xtest("Options test navigate", async () => {
  console.log("CRX_PATH", CRX_PATH);
  const targets = await browser.targets();
  // console.log("targets", targets);
  const backgroundPageTarget = targets.find(
    target => target.type() === "background_page"
  );
  // console.log("backgroundPageTarget", backgroundPageTarget._targetInfo);
  var extensionId = backgroundPageTarget._targetInfo.url.split("/")[2];
  // console.log("extensionId", extensionId);
  //  const optionsPage = await optionsPageTarget.page();
  //  // Test the background page as you would any other page.
  //  //how to write a test of the bg page?
  //  // Can we navigate to a chrome-extension page? YES!
  const optionsPage = await browser.newPage();
  await optionsPage.goto(
    `chrome-extension://${extensionId}/html/options.html`,
    {
      waitUntil: ["load", "networkidle0"]
    }
  );
  await optionsPage.waitForSelector("#url", {
    visible: true
  });
  await optionsPage.click("#url");
  await optionsPage.type("#url", "http://iq-server:8070/");
  await optionsPage.click("#username");
  await optionsPage.type("#username", "admin");
  await optionsPage.click("#password");
  await optionsPage.type("#password", "admin123");
  await optionsPage.click("#login");
  await optionsPage.waitFor(1000);
  //have to wait for login to complete
  // let waitOptions = { waitUntil: ["domcontentloaded"] };
  // let clickOptions = { button: "left" };
  // const [response] = await Promise.all([
  //   optionsPage.waitForNavigation(waitOptions),
  //   optionsPage.click("#login", clickOptions)
  // ]);
  // console.log("response", response);
  // const [response] = await Promise.all([
  //   // optionsPage.waitForNavigation(waitOptions),
  //   optionsPage.waitFor("#appID"),
  //   optionsPage.waitFor(1000),
  //   optionsPage.click("#login")
  // ]);

  var appId = await optionsPage.evaluate(() => {
    let dropDown = document.querySelector("select#appId");
    let elements = [...dropDown];
    console.log("Dropdown", dropDown);
    return elements;
  });

  // console.log("appId:", appId);
  var items = appId;
  // console.log("items:", items);
  const numElements = appId.length;
  console.log("numElements", numElements);

  expect(numElements).toBeGreaterThan(0);
}, 10000);

xtest("Options test bug duplicate items", async () => {
  console.log("CRX_PATH", CRX_PATH);
  const targets = await browser.targets();
  // console.log("targets", targets);
  const backgroundPageTarget = targets.find(
    target => target.type() === "background_page"
  );
  // console.log("backgroundPageTarget", backgroundPageTarget._targetInfo);
  var extensionId = backgroundPageTarget._targetInfo.url.split("/")[2];
  // console.log("extensionId", extensionId);
  //  const optionsPage = await optionsPageTarget.page();
  //  // Test the background page as you would any other page.
  //  //how to write a test of the bg page?
  //  // Can we navigate to a chrome-extension page? YES!
  // get list of tabs
  let pages = await browser.pages();
  // initially the default empty tab
  let optionsPage = pages[0];

  //  const optionsPage = await browser.newPage();
  await optionsPage.goto(
    `chrome-extension://${extensionId}/html/options.html`,
    {
      waitUntil: ["load", "networkidle0"]
    }
  );
  await optionsPage.waitForSelector("#url", {
    visible: true
  });
  await optionsPage.click("#url");
  await optionsPage.type("#url", "http://iq-server:8070/");
  await optionsPage.click("#username");
  await optionsPage.type("#username", "admin");
  await optionsPage.click("#password");
  await optionsPage.type("#password", "admin123");
  await optionsPage.click("#login");
  await optionsPage.waitFor(1000);
  //have to wait for login to complete
  // let waitOptions = { waitUntil: ["domcontentloaded"] };
  // let clickOptions = { button: "left" };
  // const [response] = await Promise.all([
  //   optionsPage.waitForNavigation(waitOptions),
  //   optionsPage.click("#login", clickOptions)
  // ]);
  // console.log("response", response);
  // const [response] = await Promise.all([
  //   // optionsPage.waitForNavigation(waitOptions),
  //   optionsPage.waitFor("#appID"),
  //   optionsPage.waitFor(1000),
  //   optionsPage.click("#login")
  // ]);

  var appId = await optionsPage.evaluate(() => {
    let dropDown = document.querySelector("select#appId");
    let elements = [...dropDown];
    console.log("Dropdown", dropDown);
    return elements;
  });

  // console.log("appId:", appId);
  // var items = appId;
  // console.log("items:", items);
  let numElements = appId.length;
  console.log("numElements", numElements);

  //hit login again. Bug is duplicating items
  await optionsPage.click("#login");
  await optionsPage.waitFor(1000);

  appId = await optionsPage.evaluate(() => {
    let dropDown = document.querySelector("select#appId");
    let elements = [...dropDown];
    console.log("Dropdown", dropDown);
    return elements;
  });
  let numElements2 = appId.length;
  // console.log("numElements2", numElements2);

  expect(numElements2).toBe(numElements);
}, 10000);

async function waitSeconds(seconds) {
  function delay(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }
  await delay(seconds);
}
