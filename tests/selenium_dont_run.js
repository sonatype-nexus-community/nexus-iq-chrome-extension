//note chromedriver 76 downloaded from http://chromedriver.storage.googleapis.com/index.html?path=76.0.3809.68/
//installed into /usr/local/bin
const fs = require("fs");
describe("test chrome extension", () => {
  const { Builder, By, Key, until } = require("selenium-webdriver");
  var driver;

  beforeEach(() => {
    driver = new Builder().forBrowser("chrome").build();
  });

  afterEach(() => {
    driver.quit();
  });

  it("should open search.gocenter.io", async () => {
    //chrome-extension://nkpgoindccoclcgddkoadidecjfhchdi/options.html
    //chrome-extension://nkpgoindccoclcgddkoadidecjfhchdi/popup.html
    await driver.get(
      "https://search.gocenter.io/github.com~2Fgo-gitea~2Fgitea/info?version=v1.5.1"
    );
    await driver.wait(
      until.elementLocated(By.id("selenium-container")),
      10000,
      "Could not locate element"
    );
    await driver
      .findElement(By.id("selenium-container"))
      .getText()
      .then(function(text) {
        console.log("Query: ", text);
      });
  });

  it("should open chrome extension options.html", async () => {
    //chrome-extension://nkpgoindccoclcgddkoadidecjfhchdi/options.html
    //chrome-extension://nkpgoindccoclcgddkoadidecjfhchdi/popup.html
    await driver.get(
      "chrome-extension://nkpgoindccoclcgddkoadidecjfhchdi/options.html"
    );
    driver.getTitle().then(title => {
      expect(title).stringMatching(/^chrome-extension/);
    });
  });
});
