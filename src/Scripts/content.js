/*jslint es6  -W024 */
"use strict";

console.log("content.js?v1.9.8");
// import { formats } as utils from "./utils.js";
// const { formats } = require("../src/Scripts/utils");

var browser;
var message;
if (typeof chrome !== "undefined") {
  browser = chrome;
  browser.runtime.onMessage.addListener(gotMessage);
}

function gotMessage(receivedMessage, sender, sendResponse) {
  try {
    console.log("gotMessage", receivedMessage);
    message = receivedMessage;

    console.log(
      "messageTypes.vulnerability",
      message.messagetype,
      message.messagetype === messageTypes.vulnerability
    );

    switch (message.messagetype) {
      case messageTypes.beginEvaluate:
        console.debug("begin evaluate message");
        processPage(message);
        break;
      case messageTypes.vulnerability:
        console.log("vulnerability message", message);
        processVulnerability(message);
        break;
      default:
        console.log("Unknown message type: " + message.messagetype);
        break;
    }
  } catch (err) {
    let errmessage = {
      artifact: null,
      message: err.message,
      messagetype: messageTypes.error,
    };
    browser.runtime.sendMessage(errmessage);
  }
}

function processVulnerability(message) {
  console.log("processVulnerability", message);
  let artifact = message.artifact;
  let vulnClass = message.message.vulnClass;
  console.debug("Setting vuln class: " + vulnClass);
  // console.debug("browser: ", browser);
  var repoDetails = findRepoType();
  console.debug("repoDetails: ", repoDetails);
  if (repoDetails) {
    var x = document.querySelectorAll(repoDetails.titleSelector);
    console.debug("found titles", x);
    let maxnum = 1; //x.length;
    for (var i = 0; i < maxnum; i++) {
      console.debug("adding to class: " + vulnClass);
      x[i].classList.add(vulnClass);
      x[i].classList.add("vuln");
    }
  }
}

function processPage(message = { messagetype: messageTypes.beginEvaluate }) {
  console.log("processPage - message:", message);
  $(window).bind("load", function () {
    // code goes here
    console.log("Page loaded", $("div > h2"));
  });
  // var faScript = $(document.createElement('script')).attr('src', 'https://kit.fontawesome.com/a076d05399.js');
  // $(body).append(faScript);

  //please tell what is my url and what is my content
  var url = window.location.href;
  console.log("url", url);
  if (message.messagetype !== messageTypes.evaluateComponent) {
    let artifact = ParsePage();
    console.log("artifact", artifact);
    if (artifact != undefined) {
      let format = artifact.format;
    }
    let evaluatemessage = {
      artifact: artifact,
      messagetype: messageTypes.evaluateComponent,
      url: url,
    };
    console.log(
      "browser.runtime.sendMessage(evaluatemessage)",
      evaluatemessage
    );

    browser.runtime.sendMessage(evaluatemessage);
  } else if (message.messagetype !== messageTypes.annotateComponent) {
    console.log("message.messagetype", message.messagetype);
  } else {
    console.log("message.messagetype", message.messagetype);
  }
}
