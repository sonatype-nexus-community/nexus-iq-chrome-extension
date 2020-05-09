/*jslint es6  -W024 */
"use strict";
console.log("popup.js");
// import * as utils from "./js";
const timeout = 3000; //3000milliseconds
let hasLoadedHistory;
var browser;
// var messageTypes = messageTypes;
// var artifact = artifact;
// var settings = settings;
// var nexusArtifact = nexusArtifact;
// var dataSources = dataSources;

if (typeof chrome !== "undefined") {
  browser = chrome;
}

//var settings;
//var componentInfoData;
$(async function () {
  let displayMessageData;
  try {
    //adding code to check if you need to login

    //whenever I open,  I begin an evaluation immediately
    //the icon is disabled for pages that I dont parse
    console.log("ready!");
    //setupAccordion();
    showLoader();
    $("#error").hide();
    let sourceUrl;
    const _selectTabHandler = (e, tab) => {
      selectTabHandler(e, tab, sourceUrl);
    };
    let tabOptions = {
      beforeActivate: _selectTabHandler,
    };
    //all logic has to happen after the tabs are inited
    //this draws the GUII using jQueryUI
    $("#tabs").tabs(tabOptions);
    hasLoadedHistory = false;
    $("div#dialogSecurityDetails").dialog({
      autoOpen: false,
    });
    let settings = await BuildSettingsFromGlobal();
    console.log("settings", settings);
    if (
      typeof settings === "undefined" ||
      settings.url === null ||
      !settings.hasApprovedServer
    ) {
      //we have not logged in
      //show them the login page
      browser.tabs.create({ url: "html/options.html?connected=false" });
      let errorMsg =
        "You have not logged in. Please open the options page and login. You will have to approve permissions to access the url. Read the instructions if not clear.";
      throw errorMsg;
    }
    //begin evaluation sends a message to the background script
    //and to the content script
    //I may be able to cheat and just get the URL, which simplifies the logic
    //if the URL is not parseable then I will have to go the content script to read the DOM
    //Note the URL is now only available via a user action
    //this is because we want to turn off the 'tabs' permissions
    //this reduces the functionality of the plugin but improves the security
    //I have an option in the options tab to enable continuous eval
    let sourceTab = await GetActiveTab();
    sourceUrl = sourceTab.url;
    console.log("tab", sourceUrl);

    displayMessageData = await beginEvaluation(sourceTab);
    // Promise.race([waitCursorTimeOut, beginEvaluation]).then(function(value) {
    //   console.log(value);
    // });
    if (displayMessageData) {
      await displayMessageDataHTML(displayMessageData, sourceUrl);
    }
  } catch (error) {
    console.log("Popup Error", error, error.stack, error.stack || error);
    showError(
      "The display failed. Please contact support. " +
        "<BR>" +
        (error.stack || error)
    );
  } finally {
    console.log("popup-finally", displayMessageData);
    // if (typeof displayMessageData === "undefined") {
    //   //something went wrong and we never displayed the content.
    //   //the wheel is spinning show an error
    //   showError("The display failed. Please contact support");
    // }
  }
});

const waitCursorTimeOut = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout, "correct100msResult");
  });
};

const gotMessage = async (respMessage, sender, sendResponse) => {
  try {
    //this is the callback handler for a message received
    console.log("popup got message", respMessage);
    let hasError = false;
    let sourceUrl = respMessage.url;
    await BuildSettingsFromGlobal();
    switch (respMessage.messagetype) {
      case messageTypes.evaluateComponent:
        console.log("messageTypes.evaluateComponent", artifact);
        setArtifact(respMessage.artifact);
        let displayMessage = await evaluateComponent(
          artifact,
          settings,
          sourceUrl
        );
        await displayMessageDataHTML(displayMessage, sourceUrl);
        break;
      case messageTypes.displayMessage:
        // alert("displayMessage");
        await displayMessageDataHTML(respMessage, sourceUrl);
        break;
      case messageTypes.loggedIn:
        //logged in so now we evaluate
        console.log("logged in, now evaluate");
        // let evalBegan = beginEvaluation();
        hideLoader(hasError);
        break;
      case messageTypes.loginFailedMessage:
        hasError = true;
        //display error
        console.log("display error", respMessage);
        let errorShown = showError(respMessage.message.response);
        hideLoader(hasError);
        break;
      default:
      //do nothing for now
    }
  } catch (error) {
    console.log("gotmessage error", error);
    showError(
      "The display failed. Please contact support. " + "<BR>" + error.stack
    );
  } finally {
    console.log("gotmessage finally");
    hideLoader("Close loader");
  }
};

browser.runtime.onMessage.addListener(gotMessage);

const showLoader = () => {
  $(".loader").fadeIn("slow");
};

const hideLoader = (hasError) => {
  //$(".loader").fadeOut("slow");
  document.getElementById("loader").style.display = "none";
  document.getElementById("tabs").style.display = "block";
};

const selectTabHandler = async (e, tab, sourceTab) => {
  //lazy loading of history
  //only do it if the user clicks on the tab
  console.log(
    "selectTabHandler-nexusArtifact, artifact, dataSources, settings",
    nexusArtifact,
    artifact,
    dataSources,
    settings,
    e,
    tab,
    sourceTab
  );
  showLoader();
  const remediationTab = 2;
  if (
    tab.newTab.index() === remediationTab &&
    !hasLoadedHistory &&
    artifact.datasource === dataSources.NEXUSIQ
  ) {
    $("<p></p>", {
      text: "Please wait while we load the Version History...",
      class: "status-message ui-corner-all",
    })
      .appendTo(".ui-tabs-nav", "#demo")
      .fadeOut(5000, function () {
        $(this).remove();
      });
    let remediation;
    console.log("hasVulns", hasVulns);
    if (hasVulns || true) {
      remediation = await showRemediation(nexusArtifact, settings);
    }
    let allVersions = await GetAllVersions(
      nexusArtifact,
      settings,
      remediation
    );
    let currentVersion =
      nexusArtifact.component.componentIdentifier.coordinates.version;

    await renderGraph(allVersions, remediation, currentVersion, sourceTab);
    hasLoadedHistory = true;
  }
  hideLoader();
};

const createHTML = async (message, settings, sourceUrl) => {
  console.log("createHTML(message)", message, settings, sourceUrl);

  // console.log(componentDetails.length)
  // const thisComponent = componentDetails["0"];
  // console.log('thisComponent')
  // console.log(thisComponent)
  switch (message.artifact.datasource) {
    case dataSources.NEXUSIQ:
      var componentDetails = message.message.response;
      console.log("componentDetails", componentDetails);
      // let thisComponent = message.message.response.componentDetails["0"];
      let hasVulns = renderSecurityData(message, settings);
      renderComponentData(message, sourceUrl);
      renderLicenseData(message);
      setHasVulns(hasVulns);
      //store nexusArtifact in Global variable
      // let remediation
      // if (hasVulns) {
      //     remediation = await showRemediation(nexusArtifact, settings)
      // }
      // let allVersions = await GetAllVersions(nexusArtifact, settings, remediation)
      // renderGraph(data, remediation, currentVersion);
      break;
    case dataSources.OSSINDEX:
      //from OSSINdex
      console.log("OSSINDEX");
      renderComponentDataOSSIndex(message);
      renderLicenseDataOSSIndex(message);
      renderSecurityDataOSSIndex(message);
      let advice = "No remediation advice available";
      $("#remediation").html(advice);
      break;
    default:
      //not handled
      console.log("unhandled case");
      console.log(message);
  }
};

const renderComponentDataOSSIndex = (message) => {
  console.log("renderComponentDataOSSIndex", message);
  let packageName = unescape(message.artifact.name);
  if (message.artifact.format === formats.golang) {
    //pkg:github/etcd-io/etcd@3.3.1
    let goFormat = `github/${message.artifact.namespace}/${message.artifact.name}`;
    packageName = unescape(goFormat);
  }
  $("#format").html(message.artifact.format);
  $("#package").html(packageName);
  $("#version").html(message.artifact.version);

  $("#hash").html(message.message.response.description);
  $("#hash_label").html("Description:");

  $("#matchstate").html(message.message.response.reference);
  $("#datasource").html(message.artifact.datasource);
  // $("#PackageSource").html(url);
  $("CatalogDate_row").addClass("invisible");
  $("RelativePopularity_Row").addClass("invisible");
  $("#catalogdate").html("-");
  $("#relativepopularity").html("-");

  renderSecuritySummaryOSSIndex(message);
  //document.getElementById("matchstate").innerHTML = componentInfoData.componentDetails["0"].matchState;
  // $("#matchstate").html(message.message.response.reference)
};

const renderLicenseDataOSSIndex = (message) => {
  //not supported
  //$("#tabs-2").addClass("invisible");

  $("#declaredlicenses").html("<h3>OSSIndex does not carry license data</h3>");
  $("#licensetable").addClass("invisible");
};

const renderSecurityDataOSSIndex = (message) => {
  console.log("renderSecurityDataOSSIndex", message);
  let securityIssues = message.message.response.vulnerabilities;
  let strAccordion = "";
  // console.log("renderSecurityDataOSSIndex", message, securityIssues.length);
  securityIssues.sort((securityIssues1, securityIssues2) => {
    // console.log(securityIssues1.severity);
    return securityIssues2.cvssScore - securityIssues1.cvssScore;
  });
  if (securityIssues.length > 0) {
    for (let i = 0; i < securityIssues.length; i++) {
      let securityIssue = securityIssues[i];

      //console.log(securityIssue.reference);
      //console.log(i);
      let vulnerabilityCode = "";
      if (typeof securityIssue.cve === "undefined") {
        vulnerabilityCode = " No CVE ";
      } else {
        vulnerabilityCode = securityIssue.cve;
      }
      let className = styleCVSS(securityIssue.cvssScore);
      // let vulnerabilityCode = (typeof securityIssue.cve === "undefined") ? 'No CVE' : securityIssue.cve;
      strAccordion +=
        '<h3><span class="headingreference">' +
        vulnerabilityCode +
        '</span><span class="headingseverity ' +
        className +
        '">CVSS:' +
        securityIssue.cvssScore +
        "</span></h3>";
      // strAccordion += '<h3><span class="headingreference">' + vulnerabilityCode + '</span><span class="headingseverity ' + className +'">CVSS:' + securityIssue.cvssScore + '</span></h3>';
      strAccordion += "<div>";
      strAccordion += '<table class="optionstable">';
      strAccordion +=
        '<tr><td><span class="label">Title:</span></td><td><span class="data">' +
        securityIssue.title +
        "</span></td></tr>";
      strAccordion +=
        '<tr><td><span class="label">Score:</span></td><td><span class="data">' +
        securityIssue.cvssScore +
        "</span></td></tr>";
      strAccordion +=
        '<tr><td><span class="label">CVSS 3 Vector:</span></td><td><span class="data">' +
        securityIssue.cvssVector +
        "</span></td></tr>";
      strAccordion +=
        '<tr><td><span class="label">Description:</span></td><td><span class="data">' +
        securityIssue.description +
        "</span></td></tr>";
      strAccordion +=
        '<tr><td><span class="label">Id:</span></td><td><span class="data">' +
        securityIssue.id +
        "</span></td></tr>";
      strAccordion +=
        '<tr><td><span class="label">Reference:</span></td><td><span class="data">' +
        securityIssue.reference +
        "</span></td></tr>";
      strAccordion += "</table>";
      strAccordion += "</div>";
    }
    // console.log(strAccordion);
    $("#accordion").html(strAccordion);
    //$('#accordion').accordion({heightStyle: 'content'});
    $("#accordion").accordion({ heightStyle: "panel" });
    // var autoHeight = $( "#accordion" ).accordion( "option", "autoHeight" );
    // $( "#accordion" ).accordion( "option", "autoHeight", false );
    // $("#accordion").accordion();
  } else {
    strAccordion += "<h3>No Security Issues Found</h3>";
    strAccordion += "<div>";
    strAccordion += "</div>";
    $("#accordion").html(strAccordion);
    //$('#accordion').accordion({heightStyle: 'content'});
    $("#accordion").accordion({ heightStyle: "panel" });
  }
};

const renderComponentData = (message, sourceUrl) => {
  console.log("renderComponentData-thisComponent:", message, sourceUrl);
  let thisComponent = message.message.response.componentDetails["0"];
  let component = thisComponent.component;
  console.log("component:", component);
  let format = component.componentIdentifier.format;
  $("#format").html(format);
  let coordinates = component.componentIdentifier.coordinates;
  console.log("coordinates:", coordinates);
  let display, thisCoords;
  switch (format) {
    case formats.maven:
      // console.log(coordinates.groupId);
      thisCoords = new MavenCoordinates(
        coordinates.groupId,
        coordinates.artifactId,
        coordinates.version
      );
      display = thisCoords.display();
      // $("#package").html(display);
      $("#package").html(`${coordinates.groupId}:${coordinates.artifactId}`);
      break;
    case formats.npm:
      $("#package").html(coordinates.packageId);
      break;
    case formats.nuget:
      $("#package").html(coordinates.packageId);
      break;
    case formats.gem:
      $("#package").html(coordinates.name);
      break;
    case formats.pypi:
      $("#package").html(coordinates.name);
      break;
    case formats.golang:
      $("#package").html(coordinates.name);
      break;
    case formats.rpm:
      $("#package").html(coordinates.name);
      break;
    case formats.cocoapods:
      $("#package").html(coordinates.name);
      break;

    default:
      $("#package").html("Unknown format");
      break;
  }
  console.log("coordinates.version:", coordinates.version);
  $("#version").html(coordinates.version);
  SetHash(component.hash);
  // artifact.hash = component.hash;
  $("#hash").html(component.hash);

  //document.getElementById("matchstate").innerHTML = componentInfoData.componentDetails["0"].matchState;
  $("#matchstate").html(thisComponent.matchState);
  $("#catalogdate").html(thisComponent.catalogDate);
  $("#relativepopularity").html(thisComponent.relativePopularity);
  $("#datasource").html(message.artifact.datasource);
  $("#PackageSource").html(sourceUrl);
  renderSecuritySummaryIQ(message);
};

const renderSecuritySummaryIQ = (message) => {
  let highest = Highest_CVSS_Score(message);
  let className = styleCVSS(highest);
  $("#Highest_CVSS_Score").html(highest).addClass(className);

  let numIssues = Count_CVSS_Issues(message);
  let theCount = ` within ${numIssues} security issues`;
  $("#Num_CVSS_Issues").html(theCount);
};

const renderSecuritySummaryOSSIndex = (message) => {
  let highest = Highest_CVSS_ScoreOSSIndex(message);
  let className = styleCVSS(highest);
  $("#Highest_CVSS_Score").html(highest).addClass(className);

  let numIssues = Count_CVSS_IssuesOSSIndex(message);
  let theCount = ` within ${numIssues} security issues`;
  $("#Num_CVSS_Issues").html(theCount);
};

const renderLicenseData = (message) => {
  var thisComponent = message.message.response.componentDetails["0"];
  let licenseData = thisComponent.licenseData;
  if (licenseData.declaredLicenses.length > 0) {
    if (licenseData.declaredLicenses["0"].licenseId) {
      //$("#declaredlicenses_licenseId").html(licenseData.declaredLicenses["0"].licenseId);
      //<a href="https://en.wikipedia.org/wiki/{{{licenseId}}}_License" target="_blank">https://en.wikipedia.org/wiki/{{{licenseId}}}_License</a>
      //https://spdx.org/licenses/0BSD.html
      let link =
        "https://en.wikipedia.org/wiki/" +
        licenseData.declaredLicenses["0"].licenseId +
        "_License";
      console.log("link", link, licenseData.declaredLicenses["0"].licenseName);
      $("#declaredlicenses_licenseLink").attr("href", link);
      $("#declaredlicenses_licenseLink").html(
        licenseData.declaredLicenses["0"].licenseId
      );
    }
    //$("#declaredlicenses_licenseLink").html(licenseData.declaredLicenses["0"].licenseId);
    $("#declaredlicenses_licenseName").html(
      licenseData.declaredLicenses["0"].licenseName
    );
  }
  if (thisComponent.licenseData.observedLicenses.length > 0) {
    $("#observedLicenses_licenseId").html(
      thisComponent.licenseData.observedLicenses["0"].licenseId
    );
    //document.getElementById("observedLicenses_licenseLink").innerHTML = componentInfoData.componentDetails["0"].licenseData.observedLicenses["0"].licenseName;
    $("#observedLicenses_licenseName").html(
      thisComponent.licenseData.observedLicenses["0"].licenseName
    );
  }
};

const Highest_CVSS_Score = (message) => {
  console.log("Highest_CVSS_Score(beginning)", message);
  var thisComponent = message.message.response.componentDetails["0"];

  //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
  let securityIssues = thisComponent.securityData.securityIssues;
  var highestSecurityIssue = Math.max.apply(
    Math,
    securityIssues.map(function (securityIssue) {
      return securityIssue.severity;
    })
  );
  console.log("highestSecurityIssue");
  console.log(highestSecurityIssue);

  if (
    typeof highestSecurityIssue === "undefined" ||
    highestSecurityIssue == -Infinity
  ) {
    highestSecurityIssue = "NA";
  }
  console.log("Highest_CVSS_Score(ending)", highestSecurityIssue);
  return highestSecurityIssue;
};

const Highest_CVSS_ScoreOSSIndex = (message) => {
  console.log("Highest_CVSS_Score(beginning)", message);
  var thisComponent = message.message.response;

  //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
  let securityIssues = thisComponent.vulnerabilities;
  var highestSecurityIssue = Math.max.apply(
    Math,
    securityIssues.map(function (securityIssue) {
      return securityIssue.cvssScore;
    })
  );
  console.log("highestSecurityIssue");
  console.log(highestSecurityIssue);

  if (
    typeof highestSecurityIssue === "undefined" ||
    highestSecurityIssue == -Infinity
  ) {
    highestSecurityIssue = "NA";
  }
  console.log("Highest_CVSS_Score(ending)", highestSecurityIssue);
  return highestSecurityIssue;
};

const Count_CVSS_IssuesOSSIndex = (message) => {
  console.log("Count_CVSS_Issues(beginning)", message);
  var thisComponent = message.message.response;

  //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
  let securityIssues = thisComponent.vulnerabilities;
  var countCVSSIssues = securityIssues.length;

  console.log("Count_CVSS_Issues(ending)", countCVSSIssues);
  return countCVSSIssues;
};

const Count_CVSS_Issues = (message) => {
  console.log("Count_CVSS_Issues(beginning)", message);
  var thisComponent = message.message.response.componentDetails["0"];

  //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
  let securityIssues = thisComponent.securityData.securityIssues;
  var countCVSSIssues = securityIssues.length;

  console.log("Count_CVSS_Issues(ending)", countCVSSIssues);
  return countCVSSIssues;
};

const renderSecurityData = (message) => {
  console.log("message", message);
  let hasVulnerability = false;
  var thisComponent = message.message.response.componentDetails["0"];
  let securityIssues = thisComponent.securityData.securityIssues;
  let strAccordion = "";
  console.log("securityIssues.length", securityIssues.length);
  securityIssues.sort((securityIssues1, securityIssues2) => {
    return securityIssues2.severity - securityIssues1.severity;
  });
  if (securityIssues.length > 0) {
    hasVulnerability = true;
    console.log(securityIssues);
    let index;
    for (index = 0; index < securityIssues.length; index++) {
      let securityIssue = securityIssues[index];
      console.log(securityIssue);

      let className = styleCVSS(securityIssue.severity);
      let strVulnerability = securityIssue.reference;

      strAccordion +=
        '<h3><span class="headingreference">' +
        strVulnerability.toUpperCase() +
        '</span><span class="headingseverity ' +
        className +
        '">CVSS:' +
        securityIssue.severity +
        "</span></h3>";
      strAccordion += "<div>";
      strAccordion += "<table>";
      strAccordion += "<tr>";

      let strDialog = `<div id="info_${strVulnerability}"><a href="#">${strVulnerability}<img src="../images/icons8-info-filled-50.png" class="info" alt="Info"></a></div>`;
      strAccordion +=
        '<td class="label">Reference:</td><td class="data">' +
        strDialog +
        "</td>";
      strAccordion += "</tr><tr>";
      strAccordion +=
        '<td class="label">Severity:</td><td class="data">' +
        securityIssue.severity +
        "</td>";
      strAccordion += "</tr><tr>";
      strAccordion +=
        '<td class="label">Source:</td><td class="data">' +
        securityIssue.source +
        "</td>";
      strAccordion += "</tr><tr>";
      strAccordion +=
        '<td class="label">Threat Category:</td><td class="data">' +
        securityIssue.threatCategory +
        "</td>";
      strAccordion += "</tr><tr>";
      // let strURL = securityIssue.url;
      let strURL = `<a target="_blank" rel="noreferrer" href="${
        settings.baseURL
      }assets/index.html#/vulnerabilities/${strVulnerability}">${extractHostname(
        settings.baseURL
      )}.../${strVulnerability}</a>`;
      console.log("strURL", strURL);
      // if (strURL === "null") {
      //   strURL = http://iq-server:8070/assets/index.html#/vulnerabilities/CVE-2017-5638;
      // }
      //iq-server:8070/assets/index.html#/vulnerabilities/CVE-2017-5638
      strAccordion += `<td class="label">url:</td><td class="data">${strURL}</td>`;
      strAccordion += "</tr>";
      strAccordion += "</table>";
      strAccordion += "</div>";
    }
    $("#accordion").html(strAccordion);
    $("#accordion").accordion({ heightStyle: "panel" });
    for (index = 0; index < securityIssues.length; index++) {
      let securityIssue = securityIssues[index];
      let strVulnerability = securityIssue.reference;
      var createButton = document.getElementById(`info_${strVulnerability}`);
      createButton.addEventListener("click", function () {
        showCVEDetail(strVulnerability, artifact);
      });
      console.log(createButton);
    }
  } else {
    strAccordion += "<h3>No Security Issues Found</h3>";
    $("#accordion").html(strAccordion);
    $("#accordion").accordion({ heightStyle: "panel" });
  }

  return hasVulnerability;
};

const showCVEDetail = async (cveReference, artifact) => {
  console.log("showCVEDetail", cveReference, artifact);
  // let nexusArtifact = NexusFormat(artifact);
  // let nexusArtifact = nexusArtifact;
  // let settings = settings;
  console.log("nexusArtifact", nexusArtifact);
  console.log("settings", settings);
  let myResp3 = await GetCVEDetails(cveReference, nexusArtifact, settings);
  console.log("myResp3", myResp3);
  let htmlDetails = myResp3.cvedetail.data.htmlDetails;
  //"CVSS:3.0/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H"
  let CVSS3 = "CVSS:3.0/";
  let whereCVSS = htmlDetails.search(CVSS3);
  if (whereCVSS >= 0) {
    let cvss = htmlDetails.substring(whereCVSS, whereCVSS + 44);
    console.log("cvss", cvss);
    //https://www.first.org/cvss/calculator/3.0#CVSS:3.0/AV:N/AC:H/PR:L/UI:R/S:U/C:L/I:L/A:L
    let cvssExplained = CVSSDetails(cvss);

    let cvssLink = `<div class="tooltip"><a target="_blank" rel="noreferrer" href="https://www.first.org/cvss/calculator/3.0#${cvss}">${cvss}</a><span class="tooltiptext">${cvssExplained}</span></div>;`;
    htmlDetails = htmlDetails.replace(cvss, cvssLink);
  }
  $("#dialogSecurityDetails").html(htmlDetails);
  $("#dialogSecurityDetails").dialog("option", "show", "slide");
  $("#dialogSecurityDetails").dialog("option", "hide", "puff");
  $("#dialogSecurityDetails").dialog("option", "closeOnEscape", true);
  $("#dialogSecurityDetails").dialog("option", "width", 400);
  $("#dialogSecurityDetails").dialog("option", "height", 400);
  $("#dialogSecurityDetails").dialog("option", "maxHeight", 600);
  $("#dialogSecurityDetails").dialog(
    "option",
    "title",
    `CVE Details: ${cveReference}`
  );
  $("#dialogSecurityDetails").dialog("open");
};

const showRemediation = async (nexusArtifact, settings) => {
  console.log("showRemediation", nexusArtifact, settings);
  let newVersion = await getRemediation(nexusArtifact, settings);
  let advice;
  if (newVersion == "") {
    newVersion = "Remediation advice. Not available";
    advice = `<span id="remediation"><strong> ${newVersion}</strong></span>`;
  } else {
    advice = `<span id="remediation">Remediation advice Upgrade to the new version:<strong> ${newVersion}</strong></span>`;
  }
  $("#remediation").html(advice);
  return newVersion;
};

const showError = (error) => {
  console.log("showError", error);
  let displayError;
  // $("#error").text(error);
  // $("#error").removeClass("hidden");
  //OSSINdex responds with HTML and not JSON if there is an error
  let errorText = "";
  // console.log('error.statusText', (typeof error.statusText === "undefined"));
  if (typeof error.statusText !== "undefined") {
    errorText = error.statusText;
  }
  if (typeof error.response !== "undefined") {
    errorText = error.response;
  } else {
    errorText = error;
  }
  console.log("errorText", errorText);
  if (errorText.search("<html>") > -1) {
    if (typeof error.responseText !== "undefined") {
      let errorText = error.responseText;
      var el = document.createElement("html");
      el.innerHTML = errorText;

      displayError = el.getElementsByTagName("title"); // Live NodeList of your anchor elements
    } else {
      displayError = "Unknown error";
    }
  } else {
    displayError = errorText;
  }
  displayError = "An error occurred: " + displayError;
  $("#error").html(displayError);
  $("#error").fadeIn("slow");
  $("#error").show();
  hideLoader(displayError);
};

const hideError = () => {
  $("#error").fadeOut("slow");
  $("#error").hide();
};

const setupAccordion = () => {
  console.log("setupAccordion");
  $("#accordion")
    .find(".accordion-toggle")
    .click(function () {
      //Expand or collapse this panel
      $(this).next().slideToggle("fast");
      //Hide the other panels
      $(".accordion-content").not($(this).next()).slideUp("fast");
    });
};

const sortByProperty = (objArray, prop, direction) => {
  if (arguments.length < 2)
    throw new Error(
      "ARRAY, AND OBJECT PROPERTY MINIMUM ARGUMENTS, OPTIONAL DIRECTION"
    );
  if (!Array.isArray(objArray)) throw new Error("FIRST ARGUMENT NOT AN ARRAY");
  const clone = objArray.slice(0);
  const direct = arguments.length > 2 ? arguments[2] : 1; //Default to ascending
  const propPath = prop.constructor === Array ? prop : prop.split(".");
  clone.sort(function (a, b) {
    for (let p in propPath) {
      if (a[propPath[p]] && b[propPath[p]]) {
        a = a[propPath[p]];
        b = b[propPath[p]];
      }
    }
    // convert numeric strings to integers
    a = a.match(/^\d+$/) ? +a : a;
    b = b.match(/^\d+$/) ? +b : b;
    return a < b ? -1 * direct : a > b ? 1 * direct : 0;
  });
  return clone;
};

const displayMessageDataHTML = async (respMessage, sourceUrl) => {
  console.log("displayMessageDataHTML", respMessage, sourceUrl);
  //this is a horrible kludge, I need to resolve the message properly.
  if (respMessage === "installScripts") {
    return;
  }
  let hasError = false;
  if (respMessage.message.error) {
    showError(respMessage.message.response);
  } else {
    console.log("coming in here really late.-respMessage", respMessage);
    //need to set the artifact
    artifact = respMessage.artifact;
    console.log("after content parsed artifact", artifact);

    var componentDetails = respMessage.message.response;
    console.log("componentDetails", componentDetails);

    console.log("displayMessageDataHTML: dataSources", dataSources);
    if (artifact.datasource === dataSources.NEXUSIQ) {
      nexusArtifact = componentDetails.componentDetails[0];
      console.log("nexusArtifact", nexusArtifact);
    }
    let htmlCreated = await createHTML(respMessage, settings, sourceUrl);
  }
  hideLoader(hasError);
};

const renderGraph = async (
  versionsData,
  remediation,
  currentVersion,
  sourceUrl
) => {
  console.log(
    "renderGraph",
    versionsData,
    remediation,
    currentVersion,
    sourceUrl
  );
  const versionClickHandler = async (cbdata) => {
    console.log("versionClickHandler", cbdata, currentVersion, sourceUrl);
    let newVersion = cbdata;
    let newURL = sourceUrl.replace(currentVersion, newVersion);
    console.log("newURL", newURL);
    chrome.tabs.update({
      url: newURL,
    });
  };
  Insight.ComponentInformation({
    selectable: true,
    versionClick: versionClickHandler,
    data: {
      version: currentVersion,
      nextMajorRevisionIndex: undefined,
      versions: versionsData,
    },
  });
};

///////////

const renderSecurityDataTest = (message) => {
  console.log("renderSecurityDataTest", message);
  let strAccordion = "";
  strAccordion += "<h3>ABC123</h3>";
  strAccordion += "<div>body</div>";
  strAccordion += "<h3>ABC234</h3>";
  strAccordion += "<div>body2</div>";

  $("#accordion").html(strAccordion);
  $("#accordion").accordion({ heightStyle: "panel" });
  return;
};
