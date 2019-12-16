// "use strict";
console.log("popup.js");

var artifact, nexusArtifact, hasVulns, settings, hasLoadedHistory;
var valueCSRF;

const xsrfCookieName = "CLM-CSRF-TOKEN";
const xsrfHeaderName = "X-CSRF-TOKEN";
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
      await displayMessageData(displayMessage);
      break;
    case messageTypes.displayMessage:
      // alert("displayMessage");
      await displayMessageData(respMessage);
      break;
    case messageTypes.loggedIn:
      //logged in so now we evaluate
      console.log("logged in, now evaluate");
      let evalBegan = beginEvaluation();
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
    beforeActivate: selectHandler
  };
  $("#tabs").tabs(tabOptions);
  hasLoadedHistory = false;
  $("div#dialog").dialog({
    show: "slide",
    hide: "puff",
    autoOpen: false,
    closeOnEscape: true,
    width: 425
  });

  //begin evaluation sends a message to the background script
  //amd to the content script
  //I may be able to cheat and just get the URL, which simplifies the logic
  //if the URL is not parseable then I will have to go the content script to read the DOM
  await beginEvaluation();
});

selectHandler = async function(e, tab) {
  //lazy loading of history
  //only do it if the user clicks on the tab
  showLoader();
  const remediationTab = 2;
  console.log("selectHandler", nexusArtifact, artifact);
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
    hasLoadedHistory = true;
  }
  hideLoader();
};

const beginEvaluation = async () => {
  console.log("beginEvaluation");
  //need to run query across the tabs
  //to determine the top tab.
  //I need to call sendMessage from within there as it is async
  let tab = await GetActiveTab();
  let url = tab.url;
  console.log("url", url);
  //   alert(checkPageIsHandled(url));

  let message = {
    messagetype: messageTypes.beginevaluate
  };

  if (checkPageIsHandled(url)) {
    //yes we know about this sort of URL so continue

    artifact = ParsePageURL(url);
    console.log("artifact set", artifact);

    if (artifact && artifact.version) {
      //evaluate now
      //as the page has the version so no need to insert dom
      //just parse the URL
      let evaluatemessage = {
        artifact: artifact,
        messagetype: messageTypes.evaluateComponent
      };
      console.log(
        "browser.runtime.sendMessage(evaluatemessage)",
        evaluatemessage
      );

      //try to evaluate async
      //    browser.runtime.sendMessage(evaluatemessage);
      await BuildSettingsFromGlobal();
      let displayMessage = await evaluateComponent(artifact, settings);
      // console.log("beginEvaluation - displayMessage:", displayMessage);
      // await displayMessageData(displayMessage);
    } else {
      //this sends a message to the content tab
      //hopefully it will tell me what it sees
      //this fixes a bug where we did not get the right DOM because we did not know what page we were on
      installScripts(message);
    }
  } else {
    alert("This page is not currently handled by this extension.");
    //close this document
    window.close();
  }
};

const executeScripts = (tabId, injectDetailsArray) => {
  console.log("executeScripts(tabId, injectDetailsArray)", tabId);

  function createCallback(tabId, injectDetails, innerCallback) {
    return function() {
      browser.tabs.executeScript(tabId, injectDetails, innerCallback);
    };
  }

  var callback = null;

  for (var i = injectDetailsArray.length - 1; i >= 0; --i)
    callback = createCallback(tabId, injectDetailsArray[i], callback);

  if (callback !== null) callback(); // execute outermost function
};

const installScripts = message => {
  browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let tabId = tabs[0].id;
    console.log("begin installScripts");
    var background = browser.extension.getBackgroundPage();
    background.message = message;
    console.log("sending message:", message);
    executeScripts(null, [
      { file: "Scripts/jquery.min.js" },
      { file: "Scripts/utils.js" },
      // { code: "var message = " + message  + ";"},
      { file: "Scripts/content.js" },
      { code: "processPage();" }
    ]);
    browser.tabs.sendMessage(tabId, message);
    console.log("end installScripts");
  });
};

const BuildSettingsFromGlobal = async () => {
  let promise = await GetSettings([
    "url",
    "username",
    "password",
    "appId",
    "appInternalId"
  ]);
  settings = BuildSettings(
    promise.url,
    promise.username,
    promise.password,
    promise.appId,
    promise.appInternalId
  );
  console.log("settings", settings);
};

const createAllversionsHTML = async (data, remediation, currentVersion) => {
  console.log("createAllversionsHTML", remediation, currentVersion);
  // console.log('data:', data);

  let strData = "";
  var grid;

  var options = {
    enableColumnReorder: false,
    autoHeight: false,
    enableCellNavigation: false,
    cellHighlightCssClass: "changed",
    cellFlashingCssClass: "remediation-version"
  };

  var slickData = [];

  var columns = [
    { id: "version", name: "version", field: "version" },
    { id: "security", name: "security", field: "security" },
    { id: "license", name: "license", field: "license" },
    { id: "popularity", name: "popularity", field: "popularity" },
    { id: "catalogDate", name: "catalogDate", field: "catalogDate" },
    {
      id: "majorRevisionStep",
      name: "majorRevisionStep",
      field: "majorRevisionStep"
    }
  ];
  var colId = 0;
  let rowId = 0;
  let remediationRow = -1;
  let currentVersionRow = -1;
  //let sortedData = sortByProperty(data, 'componentIdentifier.coordinates.version', 'descending')
  data.forEach(element => {
    // console.log('element.componentIdentifier.coordinates.version', element.componentIdentifier.coordinates.version)
    let version = element.componentIdentifier.coordinates.version;
    if (remediation === version) {
      remediationRow = rowId;
    }
    if (currentVersion === version) {
      currentVersionRow = rowId;
    }
    let popularity = element.relativePopularity;
    let license =
      typeof element.policyMaxThreatLevelsByCategory.LICENSE === "undefined"
        ? 0
        : element.policyMaxThreatLevelsByCategory.LICENSE;
    let myDate = new Date(element.catalogDate);
    let catalogDate = myDate.toLocaleDateString();
    let security = element.highestSecurityVulnerabilitySeverity;
    let majorRevisionStep = element.majorRevisionStep;
    strData += version + ", ";
    slickData[rowId] = {
      version: version,
      security: security,
      license: license,
      popularity: popularity,
      catalogDate: catalogDate,
      majorRevisionStep: majorRevisionStep
    };
    rowId++;
  });
  // console.log('strData', strData)
  // console.table(slickData)

  let currentVersionColor = "#85B6D5";
  let remediationVersionColor = "lawngreen";
  grid = new Slick.Grid("#myGrid", slickData, columns, options);
  if (remediationRow >= 0) {
    console.log("remediationRow", remediationRow);
    grid.scrollRowIntoView(remediationRow);
    grid.flashCell(remediationRow, grid.getColumnIndex("version"), 250);

    // $($('.grid-canvas').children()[remediationRow]).addClass('remediation-version');
    // $($('.grid-canvas').children()[remediationRow]).css("background-color", "lawngreen");

    paintRow(remediation, remediationVersionColor);
    paintRow(currentVersion, currentVersionColor);
  } else {
    //no remediation
    grid.scrollRowIntoView(currentVersionRow);
    paintRow(currentVersion, currentVersionColor);
  }

  grid.onViewportChanged.subscribe(function(e, args) {
    //event handling code.
    //find the fix
    console.log("grid.onViewportChanged");

    paintRow(remediation, remediationVersionColor);
    paintRow(currentVersion, currentVersionColor);
  });
  // paintRow (remediation, remediationVersionColor);
  // paintRow (currentVersion, currentVersionColor)
  // $("#remediation").html(strData);
};

const paintRow = (currentVersion, color) => {
  let currentVersionCell = $("div").filter(function() {
    // Matches exact string
    return $(this).text() === currentVersion;
  });
  let currentVersionCellParent = $(currentVersionCell).parents(
    "div .slick-row"
  );
  currentVersionCellParent.css("background-color", color);
};

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
  let package = unescape(message.artifact.name);
  if (message.artifact.format === formats.golang) {
    //pkg:github/etcd-io/etcd@3.3.1
    let goFormat = `github/${message.artifact.namespace}/${message.artifact.name}`;
    package = unescape(goFormat);
  }
  $("#format").html(message.artifact.format);
  $("#package").html(package);
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

const styleCVSS = severity => {
  let className;
  switch (true) {
    case severity >= 10:
      className = "criticalSeverity";
      break;
    case severity >= 7:
      className = "highSeverity";
      break;
    case severity >= 5:
      className = "mediumSeverity";
      break;
    case severity >= 0:
      className = "lowSeverity";
      break;
    default:
      className = "noneSeverity";
      break;
  }
  return className;
};

const renderSecurityData = message => {
  let retVal = false;
  var thisComponent = message.message.response.componentDetails["0"];

  //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
  let securityIssues = thisComponent.securityData.securityIssues;
  let strAccordion = "";
  console.log(securityIssues.length);
  securityIssues.sort((securityIssues1, securityIssues2) => {
    // console.log(securityIssues1.severity);
    return securityIssues2.severity - securityIssues1.severity;
  });
  if (securityIssues.length > 0) {
    retVal = true;
    console.log(securityIssues);
    for (i = 0; i < securityIssues.length; i++) {
      let securityIssue = securityIssues[i];
      console.log(securityIssue);

      //console.log(securityIssue.reference);
      //console.log(i);
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
      //strAccordion += '<p>url:</p><a href="' + securityIssue.url + '">' + securityIssue.url + '</a>';
      strAccordion +=
        '<td class="label">url:</td><td class="data">' +
        securityIssue.url +
        "</td>";
      strAccordion += "</tr>";
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
    //add event listeners
    for (i = 0; i < securityIssues.length; i++) {
      let securityIssue = securityIssues[i];
      // console.log(securityIssue);

      //console.log(securityIssue.reference);
      //console.log(i);
      let strVulnerability = securityIssue.reference;
      var createButton = document.getElementById(`info_${strVulnerability}`);
      createButton.addEventListener("click", function() {
        showCVEDetail(strVulnerability);
      });
      console.log(createButton);
    }
  } else {
    strAccordion += "<h3>No Security Issues Found</h3>";
    $("#accordion").html(strAccordion);
    //$('#accordion').accordion({heightStyle: 'content'});
    $("#accordion").accordion({ heightStyle: "panel" });
  }

  return retVal;
  //securityurl=<a href="{{{url}}}" target="_blank">url</a>
};

const showLoader = () => {
  $(".loader").fadeIn("slow");
};

const hideLoader = hasError => {
  //$(".loader").fadeOut("slow");
  document.getElementById("loader").style.display = "none";
  document.getElementById("tabs").style.display = "block";
};

const showCVEDetail = async cveReference => {
  console.log("showCVEDetail", cveReference);
  console.log("artifact", artifact);
  //  alert(cveReference)
  // let newElement = document.createElement("div");
  // newNode=document.body.appendChild(newElement);
  // newNode.setAttribute("id", "dialog");
  let nexusArtifact = NexusFormat(artifact);
  console.log("nexusArtifact", nexusArtifact);
  // if (artifact.hash) {nexusArtifact.hash = artifact.hash};
  // let promise =  await GetSettings(['url', 'username', 'password', 'appId', 'appInternalId' ])
  // let settings = BuildSettings(promise.url, promise.username, promise.password, promise.appId, promise.appInternalId)
  console.log("settings", settings);
  // let settings = BuildSettings("http://iq-server:8070/", "admin", "admin123", 'webgoat7')
  let myResp3 = await GetCVEDetails(cveReference, nexusArtifact, settings);
  console.log("myResp3", myResp3);
  let htmlDetails = myResp3.cvedetail.data.htmlDetails;
  // document.body.style.height = '600px';

  $("#dialog").html(htmlDetails);

  $("#dialog").dialog("open");
  $("#dialog").dialog("option", "maxHeight", 400);
};

const showRemediation = async (nexusArtifact, settings) => {
  console.log("showRemediation", nexusArtifact, settings);
  console.log("settings", settings);
  ///api/v2/components/remediation/application/{applicationInternalId}
  let servername = settings.baseURL;
  let url = `${servername}api/v2/components/remediation/application/${settings.appInternalId}`;
  // removeCookies(servername);
  // let xsrfHeaderName = "X-CSRF-TOKEN";
  let response = await axios(url, {
    method: "post",
    data: nexusArtifact.component,
    withCredentials: true,
    auth: {
      username: settings.username,
      password: settings.password
    },
    headers: {
      [xsrfHeaderName]: valueCSRF
    }
  });
  // add
  servername;
  let respData = response.data;
  console.log("showRemediation respData", respData);
  let newVersion;
  let advice;
  if (respData.remediation.versionChanges.length > 0) {
    newVersion =
      respData.remediation.versionChanges[0].data.component.componentIdentifier
        .coordinates.version;
    advice = `<span id="remediation">Remediation advice Upgrade to the new version:<strong> ${newVersion}</strong></span>`;
  } else {
    advice = `<span id="remediation">Remediation advice. Not available</span>`;
  }

  $("#remediation").html(advice);
  return newVersion;
};

const GetSettings = keys => {
  let promise = new Promise((resolve, reject) => {
    browser.storage.sync.get(keys, items => {
      let err = browser.runtime.lastError;
      if (err) {
        reject(err);
      } else {
        resolve(items);
      }
    });
  });
  return promise;
};

const GetCookie = (domain, xsrfCookieName) => {
  let promise = new Promise((resolve, reject) => {
    browser.cookies.getAll(
      {
        domain: domain,
        name: xsrfCookieName
      },
      cookies => {
        let err = browser.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve(cookies[0]);
        }
      }
    );
  });
  return promise;
};

const GetAllVersions = async (nexusArtifact, settings, remediation) => {
  console.log("GetAllVersions", nexusArtifact);
  let retVal;
  // let promise =  await GetSettings(['url', 'username', 'password', 'appId'])
  // let settings = BuildSettings(promise.url, promise.username, promise.password, promise.appId)

  // let comp = "%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22artifactId%22%3A%22commons-collections%22%2C%22classifier%22%3A%22%22%2C%22extension%22%3A%22jar%22%2C%22groupId%22%3A%22commons-collections%22%2C%22version%22%3A%223.2.1%22%7D%7D"
  let comp = encodeURI(
    JSON.stringify(nexusArtifact.component.componentIdentifier)
  );
  // console.log('nexusArtifact', nexusArtifact);
  console.log("comp", comp);
  // let timestamp = "1554129430974"
  var d = new Date();
  var timestamp = d.getDate();

  // let hash = "761ea405b9b37ced573d"
  let hash = nexusArtifact.component.hash;
  let matchstate = "exact";
  // let report = "2d9054219bd549db8700d3bfd027d7fd"
  //let settings = BuildSettings("http://iq-server:8070/", "admin", "admin123")
  let servername = settings.baseURL;
  // let url = `${servername}rest/ci/componentDetails/application/${appId}/allVersions?componentIdentifier=${comp}&hash=${hash}&matchState=${matchstate}&reportId=${report}&timestamp=${timestamp}`
  let url = `${servername}rest/ide/componentDetails/application/${settings.appId}/allVersions?componentIdentifier=${comp}&hash=${hash}&matchState=${matchstate}&timestamp=${timestamp}&proprietary=false`;
  // let url = `${servername}rest/ide/componentDetails/application/${appId}/allVersions?componentIdentifier=%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22artifactId%22%3A%22commons-fileupload%22%2C%22classifier%22%3A%22%22%2C%22extension%22%3A%22jar%22%2C%22groupId%22%3A%22commons-fileupload%22%2C%22version%22%3A%221.3.1%22%7D%7D&hash=c621b54583719ac03104&matchState=exact&proprietary=false HTTP/1.1`
  // let xsrfHeaderName = "";
  let response = await axios.get(url, {
    auth: {
      username: settings.username,
      password: settings.password
    },
    headers: {
      [xsrfHeaderName]: valueCSRF
    }
  });
  let data = response.data;

  let currentVersion =
    nexusArtifact.component.componentIdentifier.coordinates.version;
  // createAllversionsHTML(data, remediation, currentVersion);
  renderGraph(data, remediation, currentVersion);
};

const GetCVEDetails = async (cve, nexusArtifact, settings) => {
  console.log("begin GetCVEDetails", cve, nexusArtifact, settings);
  // let url="http://iq-server:8070/rest/vulnerability/details/cve/CVE-2018-3721?componentIdentifier=%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22artifactId%22%3A%22springfox-swagger-ui%22%2C%22classifier%22%3A%22%22%2C%22extension%22%3A%22jar%22%2C%22groupId%22%3A%22io.springfox%22%2C%22version%22%3A%222.6.1%22%7D%7D&hash=4c854c86c91ab36c86fc&timestamp=1553676800618"
  let servername = settings.baseURL; // + (settings.baseURL[settings.baseURL.length-1]=='/' ? '' : '/') ;//'http://iq-server:8070'
  //let CVE = 'CVE-2018-3721'
  let timestamp = Date.now();
  let hash = nexusArtifact.components[0].hash; //'4c854c86c91ab36c86fc'
  // let componentIdentifier = '%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22artifactId%22%3A%22springfox-swagger-ui%22%2C%22classifier%22%3A%22%22%2C%22extension%22%3A%22jar%22%2C%22groupId%22%3A%22io.springfox%22%2C%22version%22%3A%222.6.1%22%7D%7D'
  let componentIdentifier = encodeComponentIdentifier(nexusArtifact);
  let vulnerability_source;
  if (cve.search("sonatype") >= 0) {
    vulnerability_source = "sonatype";
  } else {
    //CVE type
    vulnerability_source = "cve";
  }
  //servername has a slash

  let url = `${servername}rest/vulnerability/details/${vulnerability_source}/${cve}?componentIdentifier=${componentIdentifier}&hash=${hash}&timestamp=${timestamp}`;
  // let xsrfHeaderName = "";
  let data = await axios.get(url, {
    auth: {
      username: settings.username,
      password: settings.password
    },
    headers: {
      [xsrfHeaderName]: valueCSRF
    }
  });
  console.log("data", data);
  let retVal;
  retVal = data;
  return { cvedetail: retVal };
  // var response = await fetch(url, {
  //     method: 'GET',
  //     headers: {"Authorization" : settings.auth}
  //     } );
  // var body = await response.json(); // .json() is asynchronous and therefore must be awaited
  // console.log(body);

  // try
  // {
  //     let resp = await fetch(url, {
  //         method: 'GET',
  //         headers: {"Authorization" : settings.auth}
  //         })
  //         .then(response => {
  //             return response.json()
  //         })
  //         .then(data => {
  //             retVal =  data
  //             console.log('retVal', retVal)
  //         })
  //         .catch(function(err){
  //             console.log('Fetch Error:-S', err);
  //             throw err;
  //         });
  // }
  // catch(err){
  //     //an error was found
  //     //retval is null
  //     //not json
  //     retval = {error:500, message: "Error parsing json or calling service"}
  // }
  // return {cvedetail: retVal};
  // console.log('complete GetCVEDetails');
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

const ChangeIconMessage = showVulnerable => {
  if (showVulnerable) {
    // send message to background script
    browser.runtime.sendMessage({
      messagetype: "newIcon",
      newIconPath: "images/IQ_Vulnerable.png"
    });
  } else {
    // send message to background script
    browser.runtime.sendMessage({
      messagetype: "newIcon",
      newIconPath: "images/IQ_Default.png"
    });
  }
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

const GetActiveTab = async () => {
  let params = {
    currentWindow: true,
    active: true
  };

  let promise = new Promise((resolve, reject) => {
    let tabs = browser.tabs.query(params, gotTabs);
    function gotTabs(tabs) {
      let thisTab = tabs[0];
      let err = browser.runtime.lastError;
      if (err) {
        reject(err);
      } else {
        resolve(thisTab);
      }
    }
  });
  return promise;
};

const evaluateComponent = async (artifact, settings) => {
  let resp;
  switch (artifact.datasource) {
    case dataSources.NEXUSIQ:
      // removeCookies(settings.url);
      resp = await evaluatePackage(artifact, settings);
      // addCookies(settings.url);
      break;
    case dataSources.OSSINDEX:
      resp = await addDataOSSIndex(artifact);
      break;
    default:
      alert("Unhandled datasource" + artifact.datasource);
  }
  return resp;
};

const evaluatePackage = async (artifact, settings) => {
  // removeCookies(servername);
  //This is supposed to fix the error - invalid XSRF token
  // delete axios.defaults.headers.common["Authorization"]; // or which ever header you have to remove
  // axios.defaults.xsrfHeaderName = "X-CSRF-TOKEN";
  // axios.defaults.xsrfCookieName = "CLM-CSRF-TOKEN";
  console.log("evaluateComponent", artifact, settings.auth);

  let servername = settings.baseURL;
  let domain = getDomainName(servername);
  let cookie = await GetCookie(domain, xsrfCookieName);
  console.log("cookie", cookie);
  valueCSRF = cookie.value;
  await callServer(valueCSRF);
};

const callServer = async valueCSRF => {
  console.log("callServer", valueCSRF, artifact, settings);
  let nexusArtifact = NexusFormat(artifact);
  console.log("nexusArtifact", nexusArtifact);
  let inputStr = JSON.stringify(nexusArtifact);
  console.log("inputStr", inputStr);
  let retVal;
  let error = 0;
  let servername = settings.baseURL;
  let url = `${servername}api/v2/components/details`;
  let responseVal;

  console.log("CSRF", valueCSRF);
  // let cookieName = "CLM-CSRF-TOKEN";
  // let xsrfHeaderName = "X-CSRF-TOKEN";
  let response = await axios(url, {
    method: "post",
    data: nexusArtifact,
    withCredentials: true,
    xsrfCookieName: xsrfCookieName,
    xsrfHeaderName: xsrfHeaderName,
    auth: {
      username: settings.username,
      password: settings.password
    },
    headers: {
      [xsrfHeaderName]: valueCSRF
    }
  })
    .then(data => {
      console.log("axios then", data);
      responseVal = data.data;
      retVal = { error: error, response: responseVal };
      addCookies(servername);
    })
    .catch(error => {
      console.log("error", error);
      let code, response;
      if (!error.response) {
        // network error
        code = 1;
        responseVal = `Server unreachable ${url}. ${error.toString()}`;
      } else {
        // http status code
        code = error.response.status;
        // response data
        responseVal = error.response.data;
      }
      retVal = { error: code, response: responseVal }; // error = error.response;
    });
  //handle error
  // console.log(xhr);
  // error = xhr.status;
  // response = xhr.responseText;
  let displayMessage = {
    messagetype: messageTypes.displayMessage,
    message: retVal,
    artifact: artifact
  };
  console.log("evaluatePackage - displayMessage", displayMessage);
  await displayMessageData(displayMessage);
  return displayMessage;
};

const displayMessageData = async respMessage => {
  console.log("displayMessageData", respMessage);
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
  //didn't work, so I toggle it in appcheck
  // let details = $("#aiVersionChartLabels > svg > g > g:nth-child(5)");
  // console.log("details", details.text());
  // details.click();
  // $("#aiVersionChartLabels > svg > g > g:nth-child(5)").click();
};
const addDataOSSIndex = async artifact => {
  // pass your data in method
  //OSSINdex is anonymous
  console.log("entering addDataOSSIndex: artifact", artifact);
  let retVal, inputStr;
  // https://ossindex.sonatype.org/api/v3/component-report/composer%3Adrupal%2Fdrupal%405
  //type:namespace/name@version?qualifiers#subpath
  let format = artifact.format;
  let name = artifact.name;
  let version = artifact.version;
  let OSSIndexURL;
  if (artifact.format == formats.golang) {
    //Example: pkg:github/etcd-io/etcd@3.3.1
    //https://ossindex.sonatype.org/api/v3/component-report/pkg:github/etcd-io/etcd@3.3.1
    //OSSIndexURL = "https://ossindex.sonatype.org/api/v3/component-report/" + artifact.type + '%3A' + artifact.namespace + '%3A'+ artifact.name + '%40' + artifact.version
    let goFormat = `github/${artifact.namespace}/${artifact.name}@${artifact.version}`;

    OSSIndexURL = `https://ossindex.sonatype.org/api/v3/component-report/pkg:${goFormat}`;
  } else {
    // OSSIndexURL= "https://ossindex.sonatype.org/api/v3/component-report/" + format + '%3A'+ name + '%40' + version
    //https://ossindex.sonatype.org/api/v3/component-report/pkg:github/jquery/jquery@3.0.0
    OSSIndexURL = `https://ossindex.sonatype.org/api/v3/component-report/pkg:${artifact.format}/${artifact.name}@${artifact.version}`;
  }
  let status = false;
  //components[""0""].componentIdentifier.coordinates.packageId
  // console.log('settings');
  // console.log(settings);
  // console.log(settings.auth);
  // console.log("inputdata");
  console.log("artifact request", artifact);
  console.log("OSSIndexURL request", OSSIndexURL);
  inputStr = JSON.stringify(artifact);

  let response = await axios(OSSIndexURL, {
    method: "get",
    data: inputStr

    // withCredentials: true,
    // auth: {
    //   username: settings.username,
    //   password: settings.password
    // }
  })
    .then(data => {
      console.log("then", data);
      responseVal = data.data;
      let error = 0;
      retVal = { error: error, response: responseVal };
    })
    .catch(error => {
      console.log("error", error);
      let code, response;
      if (!error.response) {
        // network error
        code = 1;
        responseVal = `Server unreachable ${url}. ${error.toString()}`;
      } else {
        // http status code
        code = error.response.status;
        // response data
        responseVal = error.response.data;
      }
      retVal = { error: code, response: responseVal }; // error = error.response;
    });
  let displayMessage = {
    messagetype: messageTypes.displayMessage,
    message: retVal,
    artifact: artifact
  };
  await displayMessageData(displayMessage);
  console.log("addDataOSSIndex - displayMessage:", displayMessage);
  return displayMessage;
};
