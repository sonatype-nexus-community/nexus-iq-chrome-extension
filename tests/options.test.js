const puppeteer = require("puppeteer");
const CRX_PATH = require("path").join(__dirname, "../src/");
xtest("Options Page applications list", async () => {
  const browserPuppeteer = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`
    ]
  });
  // const targets = await browser.targets();
  // const backgroundPageTarget = targets.find(
  //   target => target.type() === "background_page"
  // );
  // const backgroundPage = await backgroundPageTarget.page();
  // Test the background page as you would any other page.
  //how to write a test of the bg page?
  // Can we navigate to a chrome-extension page? YES!
  try {
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
    await browserPuppeteer.close();
  } catch (error) {
    console.log(error);
    await browser.close();
  } finally {
    await browser.close();
  }
});

xtest("Pupeteer launch", async () => {
  console.log("CRX_PATH", CRX_PATH);
  puppeteer
    .launch({
      headless: false, // extensions only supported in full chrome.
      args: [
        `--disable-extensions-except=${CRX_PATH}`,
        `--load-extension=${CRX_PATH}`,
        "--user-agent=PuppeteerAgent"
      ]
    })
    .then(async browser => {
      // ... do some testing ...
      var extensionId = chrome.runtime.id;
      expect(extensionId).toEqual(68);
      await browser.close();
    });
});
