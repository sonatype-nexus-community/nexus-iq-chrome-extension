const puppeteer = require("puppeteer");

(async () => {
  const pathToExtension = require("path").join(__dirname, "../src");
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`
    ]
  });
  const targets = await browser.targets();
  const backgroundPageTarget = targets.find(
    target => target.type() === "background_page"
  );
  const backgroundPage = await backgroundPageTarget.page();
  // Test the background page as you would any other page.
  //how to write a test of the bg page?
  // Can we navigate to a chrome-extension page? YES!
  const page = await browser.newPage();
  var extensionId = chrome.runtime.id;
  await page.goto(`chrome-extension://${extensionId}/html/options.html`);
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
  //appId should have items
  await browser.close();
})();
