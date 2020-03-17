/*jslint es6  -W024 */
"use strict";
console.log("background.js");
import { checkPageIsHandled, beginEvaluation } from "./utils.js";
var browser;
if (typeof chrome !== "undefined") {
  browser = chrome;
}
/**
 * This function is the message handler from other pages
 *
 * @param {message} message -message from message sender
 * @param {*} sender -the sender
 * @param {*} sendResponse -callback handler
 */
const gotMessage = async (message, sender, sendResponse) => {
  console.log("gotMessage", message);
  // var settings;
  var retval;
  var baseURL, username, password;
  // var artifact;
  // console.log('message')
  // console.log(message)
  switch (message.messagetype) {
    case messageTypes.evaluateComponent:
      //changed this to now be handled by the background
      //if we install the script in to the content script
      //background handles it not popup
      artifact = message.artifact;
      let evaluatemessage = {
        artifact: artifact,
        messagetype: messageTypes.evaluateComponent
      };
      await BuildSettingsFromGlobal();
      console.log("settings", settings);
      let displayMessage = await evaluateComponent(artifact, settings);
      let tab = await GetActiveTab();
      if (tab) {
        let tabId = tab.id;
        displayEvaluationReults(displayMessage, tabId);
      }
      browser.runtime.sendMessage(message);
      return displayMessage;

      break;
    case messageTypes.login:
      //login attempt
      baseURL = message.baseURL;
      username = message.username;
      password = message.password;
      settings = BuildSettings(baseURL, username, password);
      window.baseURL = baseURL; //"http://localhost:8070/"
      window.username = username; //"admin"
      window.password = password; //"admin123"
      retval = login(settings);
      break;
    case messageTypes.evaluate:
      //evaluate
      artifact = message.artifact;
      retval = loadSettingsAndEvaluate(artifact);
      break;
    case messageTypes.displayMessage:
      //display message
      //this needs to be ignored in the background.js
      //because it is for the popup only to display
      console.log("background display message message");
      browser.runtime.sendMessage(message);
      break;
    case messageTypes.artifact:
      //display message
      //this needs to be ignored in the background.js
      //because it is for the popup only to display
      console.log("background artifact message does not need to respond");
      break;
    default:
      console.log("unhandled message.messagetype", message);
    // alert('unhandled case');
  }
  sendResponse({ complete: true });
};

browser.runtime.onMessage.addListener(gotMessage);

window.serverBaseURL = "";
window.username = "";
window.password = "";
window.haveLoggedIn = false;
window.message = "";
/**
 *When installing the plugin this is called. We go straight to the options page to show the login screen
 *
 * @returns
 */
const install_notice = () => {
  if (localStorage.getItem("install_time")) return;

  var now = new Date().getTime();
  localStorage.setItem("install_time", now);
  browser.tabs.create({ url: "html/options.html" });
};
install_notice();

// getActiveTab();

const sendNotification = componentDetails => {
  if (1 === 2) {
    return;
  }
  console.log("sendNotification", componentDetails.securityData.securityIssues);
  var options = {
    type: "basic",
    title: "Vulnerable library",
    message: "Dear User this library is vulnerable",
    iconUrl: "../images/SON_logo_favicon_Vulnerable.png"
  };

  //////////////
  let securityData = componentDetails.securityData.securityIssues;
  let severity = 0;
  if (securityData && securityData.length > 0) {
    severity = securityData[0].severity;
  }
  console.debug("detected severity " + severity);
  let vulnClass = "vuln-low";
  if (severity >= 9) {
    vulnClass = "vuln-severe";
  } else if (severity >= 7) {
    vulnClass = "vuln-high";
  } else if (severity >= 5) {
    vulnClass = "vuln-med";
  }

  // console.debug("Setting vuln class: " + vulnClass);
  // console.debug('browser: ', browser);
  // var x = document.getElementsByClassName("package-name-redundant");
  // console.debug("found titles", x);
  // for (var i = 0; i < x.length; i++) {
  //   console.debug("adding to class: " + vulnClass);
  //   x[i].classList.add(vulnClass);
  // }

  let vulnMessage = {
    messagetype: messageTypes.vulnerability,
    message: {
      severity: severity,
      vulnClass: vulnClass
    }
  };

  browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    browser.tabs.sendMessage(tabs[0].id, vulnMessage);
  });
  //////////////

  browser.notifications.create(
    "NexusIQNotification",
    {
      type: "basic",
      iconUrl: "../images/SON_logo_favicon_Vulnerable.png",
      title: "Sonatype Nexus IQ Scan",
      message: "IQ found vulnerabilities in this version",
      priority: 1,
      buttons: [
        {
          title: "close"
        },
        {
          title: "Close"
        }
      ],
      isClickable: true
    },
    function() {
      console.log("chrome.runtime.lastError", browser.runtime.lastError);
    }
  );
};

const loadSettingsAndEvaluate = artifact => {
  console.log("loadSettingsAndEvaluate", artifact);

  browser.storage.sync.get(["url", "username", "password", "appId"], function(
    data
  ) {
    console.log("data: ", data);
    let username = data.username;
    let password = data.password;
    let baseURL = data.url;
    let appId = data.appId;
    let settings;
    let retval;
    if (!username) {
      // settings = BuildEmptySettings();

      let errorMessage = {
        messagetype: messageTypes.loginFailedMessage,
        message: {
          response:
            "No Login Settings have been saved yet. Go to the options page."
        },
        artifact: artifact
      };
      console.log("sendmessage");
      console.log(errorMessage);
      browser.runtime.sendMessage(errorMessage);
    } else {
      settings = BuildSettings(baseURL, username, password, appId);
      retval = evaluate(artifact, settings);
    }
    console.log("settings:", settings);
    return settings;
  });
};

const login = settings => {
  console.log("login");
  console.log(settings.auth);
  var retVal;
  // var retVal = {error: false, response: 'ok'};
  // let loggedInMessage = {
  //     messageType: messageTypes.loggedIn,
  //     message: retVal
  // }
  // browser.runtime.sendMessage(loggedInMessage);
  // return(retVal);
  // let inputstr = 'crap'
  let xhr = new XMLHttpRequest();
  xhr.open("GET", settings.loginurl, true);
  // xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  xhr.setRequestHeader("Authorization", settings.auth);
  // xhr.withCredentials = true;
  xhr.onload = function(e) {
    let error = 0;
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
        // error = 0
        // response = xhr.responseText
      } else {
        console.log(xhr.statusText);
        // error = xhr.status;
        // response = xhr.statusText;
      }
      retVal = {
        error: xhr.status !== 200,
        response: xhr.responseText
      };
      // return
      // let retval = evaluate(artifact, settings);

      if (retVal.error) {
        console.log("WebRequest error", retval);
      } else {
        console.log("happy days", retVal);
      }
      let loggedInMessage = {
        messagetype: messageTypes.loggedIn,
        message: retVal
      };
      window.haveLoggedIn = true;
      console.log("sendmessage: loggedInMessage", loggedInMessage);
      browser.runtime.sendMessage(loggedInMessage);
      return retVal;
    }
  };
  xhr.onerror = function(e) {
    console.log(xhr);
    retVal = {
      error: xhr.status,
      response: xhr.responseText
    };
    let loginFailedMessage = {
      messagetype: messageTypes.loginFailedMessage,
      message: retVal
    };
    browser.runtime.sendMessage(loginFailedMessage);
    return retVal;
  };
  // xhr.setRequestHeader("Authorization", settings.auth);
  console.log("about to send");
  xhr.send();
  console.log("sent");
  console.log(xhr);
};

const evaluate = (artifact, settings) => {
  console.log("evaluate", artifact, settings);
  let resp;

  // console.log(artifact.datasource)
  switch (artifact.datasource) {
    case dataSources.NEXUSIQ:
      removeCookies(settings.url);
      resp = callIQ(artifact, settings);
      addCookies(settings.url);
      break;
    case dataSources.OSSINDEX:
      resp = addDataOSSIndex(artifact);
      break;
    default:
      alert("Unhandled datasource" + artifact.datasource);
  }
};

const callIQ = (artifact, settings) => {
  console.log("evaluate", settings.auth, artifact);
  var requestdata = NexusFormat(artifact);
  let inputStr = JSON.stringify(requestdata);
  var retVal;
  console.log(inputStr);
  var response;

  let xhr = new XMLHttpRequest();
  let url = settings.url;
  // url.replace('http//', 'http://admin@admin123')
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  // xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  // xhr.dataType = "jsonp"

  // xhr.setRequestHeader("IEAuth", settings.auth);

  //security stopped these
  // xhr.setRequestHeader("Content-length", inputStr.length);
  // http.setRequestHeader("Connection", "close");
  xhr.setRequestHeader("Authorization", settings.auth);
  xhr.withCredentials = true;
  xhr.onload = function(e) {
    let error = 0;
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log("xhr");
        console.log(xhr);

        console.log(xhr.responseText);
        error = 0;
        // response = xhr.responseText
        response = JSON.parse(xhr.responseText);
      } else {
        console.log(xhr);
        error = xhr.status;
        response = xhr.responseText;
        // response: "This REST API is meant for system to system integration and can't be accessed with a web browser."
        // responseText: "This REST API is meant for system to system integration and can't be accessed with a web browser."
      }
      retVal = { error: error, response: response };
      // return
      // let retval = evaluate(artifact, settings);
      console.log(retVal);
      if (retVal.error) {
        console.log("we got some error");
      } else {
        console.log("happy days");
      }
      let displayMessage = {
        messagetype: messageTypes.displayMessage,
        message: retVal,
        artifact: artifact
      };
      console.log("displayMessage", displayMessage);
      browser.runtime.sendMessage(displayMessage);
      return retVal;
    }
  };
  xhr.onerror = function(e) {
    console.log(xhr);
    //let response = JSON.parse(xhr.responseText);
    let response = { errorMessage: xhr.responseText };
    retVal = { error: xhr.status, response: response };
    let displayMessage = {
      messagetype: messageTypes.displayMessage,
      message: retVal,
      artifact: artifact
    };
    browser.runtime.sendMessage(displayMessage);
    return retVal;
  };
  // xhr.setRequestHeader("Authorization", settings.auth);
  console.log("about to send");
  // xhr.send(inputStr);
  xhr.send(inputStr);
  // xhr.send();
  console.log("sent");
  console.log(xhr);
};

const ToggleIcon = tab => {
  console.log("ToggleIcon", tab);
  let found = checkPageIsHandled(tab.url);

  if (found) {
    browser.pageAction.show(tab.id);
  } else {
    browser.pageAction.hide(tab.id);
  }
  console.log(found);
};

const quickTest = async () => {
  let artifact = {
    format: "maven",
    artifactId: "springfox-swagger-ui",
    classifier: "",
    extension: "jar",
    groupId: "io.springfox",
    version: "2.6.1"
  };
  let nexusArtifact = NexusFormatMaven(artifact);
  nexusArtifact.hash = "4c854c86c91ab36c86fc";
  let settings = BuildSettings("http://iq-server:8070/", "admin", "admin123");
  let cve = "CVE-2018-3721";
  let myResp3 = await GetCVEDetails(cve, nexusArtifact, settings);
  console.log("myResp3");
  console.log(myResp3);
};

const quickTest2 = async () => {
  let artifact = {
    format: "maven",
    groupId: "commons-collections",
    artifactId: "commons-collections",
    version: "3.2.1",
    classifier: "",
    extension: "jar"
  };
  let nexusArtifact = NexusFormatMaven(artifact);
  nexusArtifact.hash = "761ea405b9b37ced573d";
  let settings = BuildSettings("http://iq-server:8070/", "admin", "admin123");
  let cve = "sonatype-2015-0002";
  let myResp3 = await GetCVEDetails(cve, nexusArtifact, settings);
  console.log("myResp3");
  console.log(myResp3);
};

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log("browser.tabs.onUpdated.addListener", tabId, changeInfo, tab);
  // let tab = await GetActiveTab();
  if (changeInfo.status == "complete") {
    let url = tab.url;

    if (checkPageIsHandled(url)) {
      // loadSettingsAndEvaluate(parseMavenURL(url));
      let displayMessageData = await beginEvaluation(tab);
      //this may need to install scripts into the background page so the next stuff
      //will be handled by the send message from the content script
      if (displayMessageData !== "installScripts") {
        displayEvaluationReults(displayMessageData, tabId);
      }
    } else {
      browser.pageAction.setIcon({
        path: "../images/SON_logo_favicon_not_vuln.png",
        tabId: tabId
      });
    }
  }
});
//does not work unfortunately
// chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
//     //page was updated
//     console.log('chrome.tabs.onUpdated.addListener', tabId, changeInfo, tab)
//     chrome.pageAction.hide(tabId);
//     if (changeInfo.status == 'complete' && tab.active && changeInfo.url) {
//       // do your things
//         console.log('chrome.tabs.onUpdated.addListener');
//         //need to tell the content script to reevaluate
//         //send a message to content.js
//         ToggleIcon(tab);
//     }
// });

// var p = new Promise(function (resolve, reject) {
//     var permission = true;
//     chrome.storage.sync.get({
//         history: true
//     }, function (items) {
//         permission = items.history;
//         resolve(permission);
//     });
// });
// p.then(function (permission) {
//     loadStuff(permission);
// });
// chrome.tabs.onSelectionChanged.addListener(function(tabId) {
//     console.log('chrome.tabs.onSelectionChanged.addListener', tabId)
//     chrome.pageAction.hide(tabId);
// });
// /////////////////Listeners///////////////////////////////////
// chrome.tabs.onActivated.addListener(function(activeInfo) {
//     console.log('chrome.tabs.onActivated.addListener(function(activeInfo) tabId', activeInfo);
//     let tabId = activeInfo.tabId;
//     // chrome.pageAction.hide(tabId)
//     // var tab = chrome.tabs.get(activeInfo.tabId, function(tab) {
//     //     let url = tab.url;
//     //     if (typeof url !== "undefined" && checkPageIsHandled(url)){
//     //         installScripts();
//     //     }
//     // });
// });

//this does work
browser.runtime.onInstalled.addListener(function() {
  // loadSettings();
  // let tabId = 0;
  // if (checkPageIsHandled(url)){
  //     // browser.pageAction.hide();
  // }else{
  //     browser.pageAction.hide(tabId);
  // }
  // https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
  const isChrome = /Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);

  if (isFirefox) {
    return;
  }
  console.log("browser.runtime.onInstalled.addListener");
  browser.declarativeContent.onPageChanged.removeRules(undefined, function() {
    browser.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          //https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: "mvnrepository.com",
              schemes: ["https"],
              pathContains: "artifact"
            }
          }),
          new browser.declarativeContent.PageStateMatcher({
            //https://search.maven.org/#artifactdetails%7Corg.apache.struts%7Cstruts2-core%7C2.3.31%7Cjar
            //bug in Chrome extensions dont handle hashes https://bugs.chromium.org/p/chromium/issues/detail?id=84024

            pageUrl: {
              hostEquals: "search.maven.org",
              schemes: ["https"],
              pathContains: "artifact"
            }
          }),
          new browser.declarativeContent.PageStateMatcher({
            //https://repo1.maven.org/maven2/com/github/jedis-lock/jedis-lock/1.0.0/

            pageUrl: {
              hostEquals: "repo1.maven.org",
              schemes: ["https"],
              pathContains: "maven2"
            }
          }),
          new browser.declarativeContent.PageStateMatcher({
            //http://repo2.maven.org/maven2/com/github/jedis-lock/jedis-lock/1.0.0/
            pageUrl: {
              hostEquals: "repo2.maven.org",
              schemes: ["http"],
              pathContains: "maven2"
            }
          }),
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: "www.npmjs.com",
              schemes: ["https"],
              pathContains: "package"
            }
          }),
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: "www.nuget.org",
              schemes: ["https"],
              pathContains: "packages"
            }
          }),
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: "pypi.org",
              schemes: ["https"],
              pathContains: "project"
            }
          }),
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: "rubygems.org",
              schemes: ["https"],
              pathContains: "gems"
            }
          }),
          //OSSINDEX
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: "packagist.org",
              schemes: ["https"],
              pathContains: "packages"
            }
          }),
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: "cocoapods.org",
              schemes: ["https"],
              pathContains: "pods"
            }
          }),
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: "cran.r-project.org",
              schemes: ["https"]
            }
          }),
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: "crates.io",
              schemes: ["https"],
              pathContains: "crates"
            }
          }),
          //perhaps add support for https://go-search.org/view?id=github.com%2fetcd-io%2fetcd
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: "search.gocenter.io",
              schemes: ["https"],
              pathContains: "github.com"
            }
          }),
          //https://github.com/jquery/jquery/releases/tag/3.0.0
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: "github.com",
              schemes: ["https"],
              pathContains: "releases/tag"
            }
          }),
          //Artifactory could be any URL but has the
          //webapp/#/artifacts pattern
          //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/us-remote/antlr/antlr/2.7.1/antlr-2.7.1.jar
          //https://repo.spring.io/webapp/#/artifacts/browse/tree/General/npmjs-cache/parseurl/-/parseurl-1.0.1.tgz
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              pathContains: "webapp"
            }
          }),
          //https://repo.spring.io/list/jcenter-cache/org/cloudfoundry/cf-maven-plugin/1.1.3/
          new browser.declarativeContent.PageStateMatcher({
            pageUrl: {
              pathContains: "list"
            },
            css: ["address"]
          }),
          //Nexus Repo
          //http://nexus:8081/#browse/browse:maven-central:antlr%2Fantlr%2F2.7.2
          //#browse/browse:
          //Chrome does not support parsing after the # in these PageMatchers

          new browser.declarativeContent.PageStateMatcher({
            css: ["label.x-component"]
          })
        ],
        actions: [new browser.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});

function displayEvaluationReults(displayMessageData, tabId) {
  console.log("displayEvaluationReults", displayMessageData, tabId);
  let responseData = displayMessageData.message.response;
  let componentDetails = responseData.componentDetails[0];
  let hasVulnerability =
    componentDetails.securityData.securityIssues.length > 0;
  console.log("hasVulnerability", hasVulnerability);
  if (hasVulnerability) {
    browser.pageAction.setIcon({
      path: "../images/SON_logo_favicon_Vulnerable.png",
      tabId: tabId
    });
    //chrome.browserAction.setBadgeText({text: "!"});
    sendNotification(componentDetails);
  } else {
    browser.pageAction.setIcon({
      path: "../images/SON_logo_favicon_not_vuln.png",
      tabId: tabId
    });
  }
}

function receiveText(resultsArray) {
  console.log(resultsArray[0]);
}
