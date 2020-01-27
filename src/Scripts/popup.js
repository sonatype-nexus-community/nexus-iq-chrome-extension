/*jslint es6  -W024 */
"use strict";
console.log("popup.js");

var browser;
if (typeof chrome !== "undefined") {
  browser = chrome;
}

const gotMessage = async (respMessage, sender, sendResponse) => {
  //this is the callback handler for a message received
  console.log("popup got message", respMessage);
  let hasError = false;
  await BuildSettingsFromGlobal();

  switch (respMessage.messagetype) {
    case messageTypes.evaluateComponent:
      console.log("messageTypes.evaluateComponent", artifact);
      artifact = respMessage.artifact;
      let displayMessage = await evaluateComponent(artifact, settings);
      await displayMessageDataHTML(displayMessage);
      break;
    case messageTypes.displayMessage:
      // alert("displayMessage");
      await displayMessageDataHTML(respMessage);
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
};

browser.runtime.onMessage.addListener(gotMessage);

const showLoader = () => {
  $(".loader").fadeIn("slow");
};

const hideLoader = hasError => {
  //$(".loader").fadeOut("slow");
  document.getElementById("loader").style.display = "none";
  document.getElementById("tabs").style.display = "block";
};

const selectTabHandler = async (e, tab) => {
  //lazy loading of history
  //only do it if the user clicks on the tab
  showLoader();
  const remediationTab = 2;
  console.log("selectTabHandler", nexusArtifact, artifact);
  if (
    tab.newTab.index() === remediationTab &&
    !hasLoadedHistory &&
    artifact.datasource === dataSources.NEXUSIQ
  ) {
    $("<p></p>", {
      text: "Please wait while we load the Version History...",
      class: "status-message ui-corner-all"
    })
      .appendTo(".ui-tabs-nav", "#demo")
      .fadeOut(2500, function() {
        $(this).remove();
      });
    let remediation;
    if (hasVulns) {
      remediation = await showRemediation(nexusArtifact, settings);
    }
    let allVersions = await GetAllVersions(
      nexusArtifact,
      settings,
      remediation
    );
    let currentVersion =
      nexusArtifact.component.componentIdentifier.coordinates.version;

    await renderGraph(allVersions, remediation, currentVersion);
    hasLoadedHistory = true;
  }
  hideLoader();
};

//var settings;
//var componentInfoData;
$(async function() {
  //whenever I open I begin an evaluation immediately
  //the icon is disabled for pages that I dont parse
  console.log("ready!");
  //setupAccordion();
  showLoader();
  $("#error").hide();

  let tabOptions = {
    beforeActivate: selectTabHandler
  };
  $("#tabs").tabs(tabOptions);
  hasLoadedHistory = false;
  $("div#dialogSecurityDetails").dialog({
    autoOpen: false
  });

  //begin evaluation sends a message to the background script
  //and to the content script
  //I may be able to cheat and just get the URL, which simplifies the logic
  //if the URL is not parseable then I will have to go the content script to read the DOM
  let tab = await GetActiveTab();
  let url = tab.url;
  let displayMessageData = await beginEvaluation(tab);
  if (displayMessageData) {
    await displayMessageDataHTML(displayMessageData);
  }
});

// const createAllversionsHTML = async (data, remediation, currentVersion) => {
//   console.log("createAllversionsHTML", remediation, currentVersion);
//   // console.log('data:', data);

//   let strData = "";
//   var grid;

//   var options = {
//     enableColumnReorder: false,
//     autoHeight: false,
//     enableCellNavigation: false,
//     cellHighlightCssClass: "changed",
//     cellFlashingCssClass: "remediation-version"
//   };

//   var slickData = [];

//   var columns = [
//     { id: "version", name: "version", field: "version" },
//     { id: "security", name: "security", field: "security" },
//     { id: "license", name: "license", field: "license" },
//     { id: "popularity", name: "popularity", field: "popularity" },
//     { id: "catalogDate", name: "catalogDate", field: "catalogDate" },
//     {
//       id: "majorRevisionStep",
//       name: "majorRevisionStep",
//       field: "majorRevisionStep"
//     }
//   ];
//   var colId = 0;
//   let rowId = 0;
//   let remediationRow = -1;
//   let currentVersionRow = -1;
//   //let sortedData = sortByProperty(data, 'componentIdentifier.coordinates.version', 'descending')
//   data.forEach(element => {
//     // console.log('element.componentIdentifier.coordinates.version', element.componentIdentifier.coordinates.version)
//     let version = element.componentIdentifier.coordinates.version;
//     if (remediation === version) {
//       remediationRow = rowId;
//     }
//     if (currentVersion === version) {
//       currentVersionRow = rowId;
//     }
//     let popularity = element.relativePopularity;
//     let license =
//       typeof element.policyMaxThreatLevelsByCategory.LICENSE === "undefined"
//         ? 0
//         : element.policyMaxThreatLevelsByCategory.LICENSE;
//     let myDate = new Date(element.catalogDate);
//     let catalogDate = myDate.toLocaleDateString();
//     let security = element.highestSecurityVulnerabilitySeverity;
//     let majorRevisionStep = element.majorRevisionStep;
//     strData += version + ", ";
//     slickData[rowId] = {
//       version: version,
//       security: security,
//       license: license,
//       popularity: popularity,
//       catalogDate: catalogDate,
//       majorRevisionStep: majorRevisionStep
//     };
//     rowId++;
//   });
//   // console.log('strData', strData)
//   // console.table(slickData)

//   let currentVersionColor = "#85B6D5";
//   let remediationVersionColor = "lawngreen";
//   grid = new Slick.Grid("#myGrid", slickData, columns, options);
//   if (remediationRow >= 0) {
//     console.log("remediationRow", remediationRow);
//     grid.scrollRowIntoView(remediationRow);
//     grid.flashCell(remediationRow, grid.getColumnIndex("version"), 250);

//     // $($('.grid-canvas').children()[remediationRow]).addClass('remediation-version');
//     // $($('.grid-canvas').children()[remediationRow]).css("background-color", "lawngreen");

//     paintRow(remediation, remediationVersionColor);
//     paintRow(currentVersion, currentVersionColor);
//   } else {
//     //no remediation
//     grid.scrollRowIntoView(currentVersionRow);
//     paintRow(currentVersion, currentVersionColor);
//   }

//   grid.onViewportChanged.subscribe(function(e, args) {
//     //event handling code.
//     //find the fix
//     console.log("grid.onViewportChanged");

//     paintRow(remediation, remediationVersionColor);
//     paintRow(currentVersion, currentVersionColor);
//   });
//   // paintRow (remediation, remediationVersionColor);
//   // paintRow (currentVersion, currentVersionColor)
//   // $("#remediation").html(strData);
// };

// const paintRow = (currentVersion, color) => {
//   let currentVersionCell = $("div").filter(function() {
//     // Matches exact string
//     return $(this).text() === currentVersion;
//   });
//   let currentVersionCellParent = $(currentVersionCell).parents(
//     "div .slick-row"
//   );
//   currentVersionCellParent.css("background-color", color);
// };

const createHTML = async (message, settings) => {
  console.log("createHTML(message)", message, settings);

  // console.log(componentDetails.length)
  // const thisComponent = componentDetails["0"];
  // console.log('thisComponent')
  // console.log(thisComponent)
  switch (message.artifact.datasource) {
    case dataSources.NEXUSIQ:
      var componentDetails = message.message.response;
      console.log("componentDetails", componentDetails);
      // let thisComponent = message.message.response.componentDetails["0"];
      renderComponentData(message);
      renderLicenseData(message);
      hasVulns = renderSecurityData(message);
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

const renderComponentDataOSSIndex = message => {
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
  $("CatalogDate_row").addClass("invisible");
  $("RelativePopularity_Row").addClass("invisible");
  $("#catalogdate").html("-");
  $("#relativepopularity").html("-");

  renderSecuritySummaryOSSIndex(message);
  //document.getElementById("matchstate").innerHTML = componentInfoData.componentDetails["0"].matchState;
  // $("#matchstate").html(message.message.response.reference)
};

const renderLicenseDataOSSIndex = message => {
  //not supported
  //$("#tabs-2").addClass("invisible");

  $("#declaredlicenses").html("<h3>OSSIndex does not carry license data</h3>");
  $("#licensetable").addClass("invisible");
};

const renderSecurityDataOSSIndex = message => {
  console.log("renderSecurityDataOSSIndex", message);
  let securityIssues = message.message.response.vulnerabilities;
  let strAccordion = "";
  // console.log("renderSecurityDataOSSIndex", message, securityIssues.length);
  securityIssues.sort((securityIssues1, securityIssues2) => {
    // console.log(securityIssues1.severity);
    return securityIssues2.cvssScore - securityIssues1.cvssScore;
  });
  if (securityIssues.length > 0) {
    for (i = 0; i < securityIssues.length; i++) {
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

const renderComponentData = message => {
  console.log("renderComponentData-thisComponent:", message);
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
      thisCoords = new MavenCoodinates(
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

    default:
      $("#package").html("Unknown format");
      break;
  }
  console.log("coordinates.version:", coordinates.version);
  $("#version").html(coordinates.version);
  artifact.hash = component.hash;
  $("#hash").html(component.hash);

  //document.getElementById("matchstate").innerHTML = componentInfoData.componentDetails["0"].matchState;
  $("#matchstate").html(thisComponent.matchState);
  $("#catalogdate").html(thisComponent.catalogDate);
  $("#relativepopularity").html(thisComponent.relativePopularity);
  $("#datasource").html(message.artifact.datasource);
  renderSecuritySummaryIQ(message);
};

const renderSecuritySummaryIQ = message => {
  let highest = Highest_CVSS_Score(message);
  let className = styleCVSS(highest);
  $("#Highest_CVSS_Score")
    .html(highest)
    .addClass(className);

  let numIssues = Count_CVSS_Issues(message);
  let theCount = ` within ${numIssues} security issues`;
  $("#Num_CVSS_Issues").html(theCount);
};

const renderSecuritySummaryOSSIndex = message => {
  let highest = Highest_CVSS_ScoreOSSIndex(message);
  let className = styleCVSS(highest);
  $("#Highest_CVSS_Score")
    .html(highest)
    .addClass(className);

  let numIssues = Count_CVSS_IssuesOSSIndex(message);
  let theCount = ` within ${numIssues} security issues`;
  $("#Num_CVSS_Issues").html(theCount);
};

const renderLicenseData = message => {
  var thisComponent = message.message.response.componentDetails["0"];
  let licenseData = thisComponent.licenseData;
  if (licenseData.declaredLicenses.length > 0) {
    if (licenseData.declaredLicenses["0"].licenseId) {
      //$("#declaredlicenses_licenseId").html(licenseData.declaredLicenses["0"].licenseId);
      //<a href="https://en.wikipedia.org/wiki/{{{licenseId}}}_License" target="_blank">https://en.wikipedia.org/wiki/{{{licenseId}}}_License</a>
      let link =
        "https://en.wikipedia.org/wiki/" +
        licenseData.declaredLicenses["0"].licenseId +
        "_License";
      console.log("link");
      console.log(link);
      console.log(licenseData.declaredLicenses["0"].licenseName);
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

const Highest_CVSS_Score = message => {
  console.log("Highest_CVSS_Score(beginning)", message);
  var thisComponent = message.message.response.componentDetails["0"];

  //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
  let securityIssues = thisComponent.securityData.securityIssues;
  var highestSecurityIssue = Math.max.apply(
    Math,
    securityIssues.map(function(securityIssue) {
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

const Highest_CVSS_ScoreOSSIndex = message => {
  console.log("Highest_CVSS_Score(beginning)", message);
  var thisComponent = message.message.response;

  //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
  let securityIssues = thisComponent.vulnerabilities;
  var highestSecurityIssue = Math.max.apply(
    Math,
    securityIssues.map(function(securityIssue) {
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

const Count_CVSS_IssuesOSSIndex = message => {
  console.log("Count_CVSS_Issues(beginning)", message);
  var thisComponent = message.message.response;

  //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
  let securityIssues = thisComponent.vulnerabilities;
  var countCVSSIssues = securityIssues.length;

  console.log("Count_CVSS_Issues(ending)", countCVSSIssues);
  return countCVSSIssues;
};

const Count_CVSS_Issues = message => {
  console.log("Count_CVSS_Issues(beginning)", message);
  var thisComponent = message.message.response.componentDetails["0"];

  //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
  let securityIssues = thisComponent.securityData.securityIssues;
  var countCVSSIssues = securityIssues.length;

  console.log("Count_CVSS_Issues(ending)", countCVSSIssues);
  return countCVSSIssues;
};

const renderSecurityData = message => {
  let hasVulnerability = false;
  var thisComponent = message.message.response.componentDetails["0"];
  let securityIssues = thisComponent.securityData.securityIssues;
  let strAccordion = "";
  console.log(securityIssues.length);
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

      let strDialog = `<div id="info_${strVulnerability}"><a href="#">${strVulnerability}<img  src="../images/icons8-info-filled-50.png" class="info" alt="Info"></a></div>`;
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
      strAccordion +=
        '<td class="label">url:</td><td class="data">' +
        securityIssue.url +
        "</td>";
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
      createButton.addEventListener("click", function() {
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
  let nexusArtifact = NexusFormat(artifact);
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

const showError = error => {
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
    errorText = response;
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
};

const hideError = () => {
  $("#error").fadeOut("slow");
  $("#error").hide();
};

const setupAccordion = () => {
  console.log("setupAccordion");
  $("#accordion")
    .find(".accordion-toggle")
    .click(function() {
      //Expand or collapse this panel
      $(this)
        .next()
        .slideToggle("fast");
      //Hide the other panels
      $(".accordion-content")
        .not($(this).next())
        .slideUp("fast");
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
  clone.sort(function(a, b) {
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

const displayMessageDataHTML = async respMessage => {
  console.log("displayMessageDataHTML", respMessage);
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

    if (artifact.datasource === dataSources.NEXUSIQ) {
      nexusArtifact = componentDetails.componentDetails[0];
      console.log("nexusArtifact", nexusArtifact);
    }
    let htmlCreated = await createHTML(respMessage, settings);
  }
  hideLoader(hasError);
};

const renderGraph = async (versionsData, remediation, currentVersion) => {
  console.log("renderGraph", versionsData, remediation, currentVersion);
  Insight.ComponentInformation({
    selectable: false,
    data: {
      version: currentVersion,
      nextMajorRevisionIndex: undefined,
      versions: versionsData
    }
  });
};