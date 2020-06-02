/*jslint es6  -W024 */

"use strict";
console.log("utils.ts");
import axios from "axios";
// import { v4 as uuidv4 } from 'uuid';
// import * as url from "url";
// import { CVSS } from "../lib/cvssCalculator.js";
// import { CVSS31 } from "../lib/cvss3.1.js";
// import { Cookie } from "cookies";
// import { Settings } from "./Settings";
// import { Artifact } from "./Artifact";
// import { AlpineArtifact } from "./AlpineArtifact";
// import { CargoArtifact } from "./CargoArtifact";
// import { ChocolateyArtifact } from "./ChocolateyArtifact";
// import { ClojarsArtifact } from "./ClojarsArtifact";
// import { CocoaPodsArtifact } from "./CocoaPodsArtifact";
// import { ComposerArtifact } from "./ComposerArtifact";
// import { ConanArtifact } from "./ConanArtifact";
// import { CondaArtifact } from "./CondaArtifact";
// import { DebianArtifact } from "./DebianArtifact";
// import { GitHubArtifact } from "./GitHubArtifact";
// import { NPMArtifact } from "./NPMArtifact";
// import { MavenArtifact } from "./MavenArtifact";
// import { NugetArtifact } from "./NugetArtifact";
// import { PyPIArtifact } from "./PyPIArtifact";
// import { RubyArtifact } from "./RubyArtifact";
import { formats } from "./Formats";
// import { nexusRepoformats } from "./NexusRepoFormats";
// import { artifactoryRepoformats } from "./ArtifactoryRepoFormats";
import { dataSources } from "./DataSources";
import { messageTypes } from "./MessageTypes";
import { Settings } from "./Settings";
import { masterSettingsList } from "./MasterSettingsList";
import { NexusFormat } from "./NexusFormat";
import {
  repoTypes,
  findRepoType,
  ParsePageURL,
  checkPageIsHandled,
} from "./RepoTypes";

var artifact, nexusArtifact, hasVulns, settings;
var valueCSRF;

var xsrfCookieName = "CLM-CSRF-TOKEN";
var xsrfHeaderName = "X-CSRF-TOKEN";

var browser;
if (typeof chrome !== "undefined") {
  browser = chrome;
}

var repoSettings: any = {
  hasApprovedNexusRepoUrl: "",
  nexusRepoUrl: "",
  hasApprovedArtifactoryRepoUrl: "",
  artifactoryRepoUrl: "",
};

const checkAllPermissions = async () => {
  return new Promise((resolve, reject) => {
    chrome.permissions.getAll((results) => {
      resolve(results);
    });
  });
};

const canLogin = async (url, username, password) => {
  //TODO: Nasty side effect, sets the messages on the page. Should just return a response message
  //need to refactor caller to handle error messages
  let message;
  return new Promise((resolve, reject) => {
    console.log("canLogin", url, username, password);
    message = "";
    let baseURL = url + (url.substr(-1) === "/" ? "" : "/");
    let urlEndPoint = baseURL + "rest/user/session";
    console.log("urlEndPoint", urlEndPoint);
    let retval;
    axios
      .get(urlEndPoint, {
        auth: {
          username: username,
          password: password,
        },

        xsrfCookieName: xsrfCookieName,
        xsrfHeaderName: xsrfHeaderName,
      })
      .then((data) => {
        console.log("Logged in", data);
        message = "Login successful";
        retval = true;
        resolve(retval);
        return retval;
      })
      .catch((error) => {
        console.log(error);
        message = error;
        retval = false;
        resolve(retval);
        return retval;
      });
  });
};

const addCookies = (url) => {
  return;

  console.log("addCookies", url);
  browser.cookies.set({
    url: url,
    name: "CLMSESSIONID", //"CLM-CSRF-TOKEN"
    value: "foo",
  });
  return;
};

const extractHostname = (url) => {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  //find & remove port number
  hostname = hostname.split(":")[0];
  //find & remove "?"
  hostname = hostname.split("?")[0];

  return hostname;
};

const getDomainName = (servername) => {
  console.log("getDomainName", servername);
  //fix trailing backslash bug. issue #70

  let domain = "." + extractHostname(servername);
  return domain;
};

const getCookieValue = async (url, cookieName) => {
  console.log("getCookieValue", url, cookieName);

  let domain = getDomainName(url);
  browser.cookies.getAll({ domain: domain, name: cookieName }, (cookies) => {
    console.log("cookies.getAll here", domain, cookieName);
    for (var i = 0; i < cookies.length; i++) {
      console.log(cookies[i]);
      if (cookies[i].name === cookieName) {
        return cookies[i].value;
      }
    }
  });
  return undefined;
};

const removeCookies = (settings_url) => {
  console.log("removeCookies");
  console.log(settings_url);
  //as of IQ 63 it allows cookies to be present in public API
  //Going to exit here
  return;
  browser.cookies.remove({
    url: settings_url,
    name: "CLMSESSIONID", //"CLM-CSRF-TOKEN"
  });
  return;
  //settings.url = http://iq-server:8070/
  let leftPart = settings_url.search("//") + 2;
  let server = settings_url.substring(leftPart);
  let rightPart = server.search(":") - 1;
  if (rightPart < 0) {
    rightPart = server.search(leftPart, "/") - 1;
    if (rightPart < 0) {
      rightPart = server.length;
    }
  }
  server = server.substring(0, rightPart + 1);
  //".iq-server"
  let domain = "." + server;
  browser.cookies.getAll({ domain: domain }, (cookies) => {
    console.log("here");
    for (var i = 0; i < cookies.length; i++) {
      console.log(cookies[i]);

      browser.cookies.remove({
        url: settings_url,
        name: cookies[i].name,
      });
    }
  });
  //the only one to remove is this one. The CLM SessionID
  browser.cookies.remove({ url: settings_url, name: "CLMSESSIONID" });
};

const encodeComponentIdentifier = (component) => {
  let actual = encodeURIComponent(
    JSON.stringify(component.componentIdentifier)
  );
  console.log(actual);
  return actual;
};

////////Parse DOM/////////

function ParsePage() {
  //returns message in format like this {messageType: "artifact", payload: artifact};
  //artifact varies depending on eco-system
  console.log("ParsePage");
  //who I am what is my address?
  let artifact;
  let format;
  let url = location.href;
  console.log("url", url);

  var repoDetails = findRepoType();

  console.debug("found repo details", repoDetails);

  if (repoDetails) {
    format = repoDetails.repoFormat;
    artifact = repoDetails.parseFunction(format, url);
  }

  console.log("ParsePage Complete - artifact:", artifact);
  //now we write this to background as
  //we pass variables through background
  let message = {
    messagetype: messageTypes.artifact,
    payload: artifact,
  };
  return artifact;
}

const BuildSettings = (
  baseURL,
  username,
  password,
  appId,
  appInternalId,
  IQCookie?,
  IQCookieSet?,
  IQCookieToken?,
  hasApprovedServer?,
  hasApprovedContinuousEval?,
  hasApprovedAllUrls?
) => {
  //let settings = {};
  console.log("BuildSettings", baseURL);
  if (typeof baseURL === "undefined" || baseURL === null) return;
  let tok = `${username}:${password}`;
  let hash = btoa(tok);
  let auth = "Basic " + hash;
  let restEndPoint = "api/v2/components/details";
  if (baseURL.substring(baseURL.length - 1) !== "/") {
    baseURL = baseURL + "/";
  }
  let url = baseURL + restEndPoint;
  //login end point
  let loginEndPoint = "rest/user/session";
  let loginurl = baseURL + loginEndPoint;

  //whenDone(settings);
  let settings = {
    username: username,
    password: password,
    tok: tok,
    hash: hash,
    auth: auth,
    restEndPoint: restEndPoint,
    baseURL: baseURL,
    url: url,
    loginEndPoint: loginEndPoint,
    loginurl: loginurl,
    appId: appId,
    appInternalId: appInternalId,
    IQCookie: IQCookie,
    IQCookieSet: IQCookieSet,
    IQCookieToken: IQCookieToken,
    hasApprovedServer: hasApprovedServer,
    hasApprovedContinuousEval: hasApprovedContinuousEval,
    hasApprovedAllUrls: hasApprovedAllUrls,
  };
  return settings;
};

const BuildSettingsFromGlobal = async () => {
  console.log("BuildSettingsFromGlobal");
  let retSettings: any = await GetSettings([
    "url",
    "username",
    "password",
    "appId",
    "appInternalId",
    "IQCookie",
    "IQCookieSet",
    "IQCookieToken",
    "hasApprovedServer",
    "hasApprovedContinuousEval",
    "hasApprovedAllUrls",
  ]);

  settings = BuildSettings(
    retSettings.url,
    retSettings.username,
    retSettings.password,
    retSettings.appId,
    retSettings.appInternalId,
    retSettings.IQCookie,
    retSettings.IQCookieSet,
    retSettings.IQCookieToken,
    retSettings.hasApprovedServer,
    retSettings.hasApprovedContinuousEval,
    retSettings.hasApprovedAllUrls
  );
  console.log("settings", settings);
  return settings;
};

const GetSettings = (keys): Promise<Settings> => {
  console.log("GetSettings", keys);
  let promise: Promise<Settings> = new Promise((resolve, reject) => {
    browser.storage.sync.get(keys, (items) => {
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

const setSettings = async (obj) => {
  return new Promise((resolve, reject) => {
    console.log(Object.values(obj)[0]);
    chrome.storage.sync.set(
      { [Object.keys(obj)[0]]: Object.values(obj)[0] },
      () => {
        //alert('saved'+ value);
        console.log("Saved obj", obj);
        resolve(true);
      }
    );
  });
};
const GetSettings2 = async (keys) => {
  // console.log("GetSettings2", key);
  var p = new Promise(function (resolve, reject) {
    chrome.storage.sync.get(keys, function (settings) {
      resolve(settings);
    });
  });

  const configOut = await p;
  return configOut;
};

const GetCookieFromConfig = async () => {
  console.log("GetCookieFromConfig");
  //get the value from storage
  //https://stackoverflow.com/questions/5892176/getting-cookies-in-a-google-chrome-extension
  //https://stackoverflow.com/questions/44186404/moving-permissions-to-optional-on-chrome-extension
  var p = new Promise(function (resolve, reject) {
    chrome.storage.sync.get({ IQCookie: true }, function (settings) {
      resolve(settings.IQCookie);
    });
  });

  const configOut = await p;
  return configOut;
};

const GetCookie = async (domain, xsrfCookieName) => {
  console.log("GetCookie", domain, xsrfCookieName);
  //get the value from storage

  let promise = new Promise((resolve, reject) => {
    browser.cookies.getAll(
      {
        domain: domain,
        name: xsrfCookieName,
      },
      (cookies) => {
        let err = browser.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          let retVal = cookies[0];
          console.log("cookies", retVal);
          resolve(retVal);
        }
      }
    );
  });
  return promise;
};

const GetCVEDetails = async (cve, nexusArtifact, settings) => {
  console.log("begin GetCVEDetails", cve, nexusArtifact, settings);
  // let url="http://iq-server:8070/rest/vulnerability/details/cve/CVE-2018-3721?componentIdentifier=%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22artifactId%22%3A%22springfox-swagger-ui%22%2C%22classifier%22%3A%22%22%2C%22extension%22%3A%22jar%22%2C%22groupId%22%3A%22io.springfox%22%2C%22version%22%3A%222.6.1%22%7D%7D&hash=4c854c86c91ab36c86fc&timestamp=1553676800618"
  let servername = settings.baseURL; // + (settings.baseURL[settings.baseURL.length-1]=='/' ? '' : '/') ;//'http://iq-server:8070'
  //let CVE = 'CVE-2018-3721'
  let timestamp = Date.now();
  //TODO: sometimes it is an array of components. May need to have a swiitch handler here
  let hash = nexusArtifact.component.hash; //'4c854c86c91ab36c86fc'
  // let componentIdentifier = '%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22artifactId%22%3A%22springfox-swagger-ui%22%2C%22classifier%22%3A%22%22%2C%22extension%22%3A%22jar%22%2C%22groupId%22%3A%22io.springfox%22%2C%22version%22%3A%222.6.1%22%7D%7D'
  let componentIdentifier = encodeComponentIdentifier(nexusArtifact.component);
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
      password: settings.password,
    },
    headers: {
      [xsrfHeaderName]: valueCSRF,
    },
  });
  console.log("data", data);
  let retVal;
  retVal = data;
  return { cvedetail: retVal };
};

const callServer = async (valueCSRF, artifact, settings) => {
  console.log("callServer", valueCSRF, artifact, settings);
  nexusArtifact = NexusFormat(artifact);
  console.log("nexusArtifact", nexusArtifact);
  let inputStr = JSON.stringify(nexusArtifact);
  console.log("inputStr", inputStr);
  let retVal;
  let error = 0;
  let servername = settings.baseURL;
  let url = `${servername}api/v2/components/details`;
  let responseVal;
  let displayMessage;
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
      password: settings.password,
    },
    headers: {
      [xsrfHeaderName]: valueCSRF,
    },
  })
    .then((data) => {
      console.log("axios then", data);
      responseVal = data.data;
      retVal = { error: error, response: responseVal };
      addCookies(servername);
    })
    .catch((error) => {
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
  displayMessage = {
    messagetype: messageTypes.displayMessage,
    message: retVal,
    artifact: artifact,
  };
  console.log("callServer - displayMessage", displayMessage);

  return displayMessage;
};

const beginEvaluation = async (tab) => {
  try {
    console.log("beginEvaluation", tab);
    let url = tab.url;
    console.log("url", url);
    let message = {
      messagetype: messageTypes.beginEvaluate,
    };

    //so first I have to make sure that it is a URL that we care about
    if (checkPageIsHandled(url)) {
      //yes we know about this sort of URL so continue
      //next check if I can simply parse the URL
      artifact = ParsePageURL(url);
      console.log("artifact set", artifact);
      if (artifact && artifact.version) {
        //evaluate now
        //as the page has the version so no need to insert dom
        //just parse the URL
        let evaluatemessage = {
          artifact: artifact,
          messagetype: messageTypes.evaluateComponent,
        };
        await BuildSettingsFromGlobal();
        let displayMessage = await evaluateComponent(artifact, settings);
        return displayMessage;
      } else {
        //this sends a message to the content tab
        //hopefully it will tell me what it sees
        //this fixes a bug where we did not get the right DOM because we did not know what page we were on
        // TODO: CPT I Iwant to get rid of this logic, we should be passnig a message not callingthe function directly
        installScripts(tab, message);
        // identifyComponent(tab, message);
        //install scripts will run, and I hope that we receive a message back
        return "installScripts";
      }
    } else {
      console.log("This page is not currently handled by this extension.");
      return "notvalid";
    }
  } catch (error) {
    console.error("beginEvaluation error", error);
    throw error;
  } finally {
    console.log("beginEvaluation - finally");
  }
};
const identifyComponent = (tab, message) => {
  console.log("identifyComponent, sending message", tab, message);

  browser.runtime.sendMessage(message);
  console.log("identifyComponent, sent  message");
};

const evaluateComponent = async (artifact, settings) => {
  console.log("evaluateComponent", artifact, settings);
  try {
    let resp;
    switch (artifact.datasource) {
      case dataSources.NEXUSIQ:
        resp = await evaluatePackage(artifact, settings);
        break;
      case dataSources.OSSINDEX:
        resp = await addDataOSSIndex(artifact);
        break;
      default:
        console.log("Unhandled datasource" + artifact.datasource);
    }
    return resp;
  } catch (error) {
    console.log("evaluateComponent-Error", error);
    throw error;
  } finally {
    console.log("evaluateComponent-finally");
  }
};

const evaluatePackage = async (artifact, settings) => {
  // try {
  // removeCookies(servername);
  //This is supposed to fix the error - invalid XSRF token
  // delete axios.defaults.headers.common["Authorization"]; // or which ever header you have to remove
  // axios.defaults.xsrfHeaderName = "X-CSRF-TOKEN";
  // axios.defaults.xsrfCookieName = "CLM-CSRF-TOKEN";
  console.log("evaluatePackage", artifact, settings.auth);
  let servername = settings.baseURL;
  let domain = getDomainName(servername);
  console.log("domain", domain);
  // let cookie = await GetCookie(domain, xsrfCookieName);
  let getSettings: any = await GetSettings(["IQCookieToken"]);
  //valueCSRF is a global varriable//TODO shold be fixed
  valueCSRF = getSettings.IQCookieToken;
  console.log("valueCSRF", valueCSRF);
  // let cookie = await GetSettings2("IQCookie");
  // console.log("cookie", cookie);
  // if (typeof cookie === "undefined") {
  //   console.log("handle missing cookie");
  //   valueCSRF = uuidv4();
  //   //server is not up most probably
  //   //do we throw an error here or exit gracefully
  //   // throw new Error(
  //   //   `Cookie: ${xsrfCookieName} not available. Server ${servername} is probably down, or you will have to set the csrfProtection setting in Config.yml`
  //   // );
  //   // return;
  // } else {
  //   valueCSRF = cookie.value;
  // }
  let displayMessage = await callServer(valueCSRF, artifact, settings);
  return displayMessage;
  // } catch (error) {
  //   console.log("evaluatePackage-Error", error);
  //   throw error;
  // } finally {
  //   console.log("evaluatePackage-finally");
  // }
};

const getRemediation = async (valueCSRF, nexusArtifact, settings) => {
  console.log("getRemediation", nexusArtifact, settings, valueCSRF);
  let servername = settings.baseURL;
  let url = `${servername}api/v2/components/remediation/application/${settings.appInternalId}`;
  console.log("getRemediation: url", url);
  let response = await axios(url, {
    method: "post",
    data: nexusArtifact.component,
    withCredentials: true,
    auth: {
      username: settings.username,
      password: settings.password,
    },
    headers: {
      [xsrfHeaderName]: valueCSRF,
    },
  });
  let respData = response.data;
  console.log("getRemediation: respData", respData);
  let newVersion = "";
  if (respData.remediation.versionChanges.length > 0) {
    newVersion =
      respData.remediation.versionChanges[0].data.component.componentIdentifier
        .coordinates.version;
  }
  return newVersion;
};

const GetAllVersions = async (valueCSRF, nexusArtifact, settings) => {
  console.log("GetAllVersions", nexusArtifact, settings);
  let retVal;
  let component = nexusArtifact.component;
  let comp = encodeURI(JSON.stringify(component.componentIdentifier));
  // console.log('nexusArtifact', nexusArtifact);
  console.log("comp", comp);
  var d = new Date();
  var timestamp = d.getDate();
  let hash = component.hash;
  let matchstate = "exact";
  let servername = settings.baseURL;
  let url = `${servername}rest/ide/componentDetails/application/${settings.appId}/allVersions?componentIdentifier=${comp}&hash=${hash}&matchState=${matchstate}&timestamp=${timestamp}&proprietary=false`;
  let response = await axios.get(url, {
    auth: {
      username: settings.username,
      password: settings.password,
    },
    headers: {
      [xsrfHeaderName]: valueCSRF,
    },
  });
  let data;
  if (typeof response.data.allVersions !== "undefined") {
    // console.log("allversions");
    data = response.data.allVersions;
  } else {
    // console.log("data");
    data = response.data;
  }
  console.log("data", data);
  return data;
};

const GetAllApplications = async (valueCSRF, nexusArtifact, settings) => {
  //{{IQServer}}/rest/componentDetails/applications?hash=2d3be19a8c96ef8d5fed&timestamp=1589327086329
  console.log("GetAllApplications", valueCSRF, nexusArtifact, settings);
  let retVal;
  let component = nexusArtifact.component;
  let comp = encodeURI(JSON.stringify(component.componentIdentifier));
  // console.log('nexusArtifact', nexusArtifact);
  console.log("comp", comp);
  var d = new Date();
  var timestamp = d.getDate();
  let hash = component.hash;
  let matchstate = "exact";
  let servername = settings.baseURL;
  let url = `${servername}rest/componentDetails/applications?hash=${hash}&timestamp=${timestamp}`;
  let response = await axios.get(url, {
    auth: {
      username: settings.username,
      password: settings.password,
    },
    headers: {
      [xsrfHeaderName]: valueCSRF,
    },
  });
  console.log("response", response);
  let data;
  if (typeof response.data.application !== "undefined") {
    // console.log("allversions");
    data = response.data.application;
  } else {
    // console.log("data");
    data = response.data;
  }
  console.log("data", data);
  return data;
};

const ChangeIconMessage = (showVulnerable) => {
  if (showVulnerable) {
    // send message to background script
    browser.runtime.sendMessage({
      messagetype: "newIcon",
      newIconPath: "images/IQ_Vulnerable.png",
    });
  } else {
    // send message to background script
    browser.runtime.sendMessage({
      messagetype: "newIcon",
      newIconPath: "images/IQ_Default.png",
    });
  }
};

const addDataOSSIndex = async (artifact) => {
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
  let responseVal; //fix issue #78
  if (artifact.format == formats.golang || artifact.format == formats.clojars) {
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
  console.log("artifact request", artifact);
  console.log("OSSIndexURL request", OSSIndexURL);
  inputStr = JSON.stringify(artifact);
  let response = await axios(OSSIndexURL, {
    method: "get",
    data: inputStr,
  })
    .then((data) => {
      console.log("then", data);
      responseVal = data.data;
      let error = 0;
      retVal = {
        error: error,
        response: responseVal,
      };
    })
    .catch((error) => {
      console.log("error", error);
      let code, response;
      if (!error.response) {
        // network error
        code = 1;
        responseVal = `Server unreachable ${OSSIndexURL}. ${error.toString()}`;
      } else {
        // http status code
        code = error.response.status;
        // response data
        responseVal = error.response.data;
      }
      retVal = {
        error: code,
        response: responseVal,
      }; // error = error.response;
    });
  let displayMessage = {
    messagetype: messageTypes.displayMessage,
    message: retVal,
    artifact: artifact,
  };
  // await displayMessageDataHTML(displayMessage);
  console.log("addDataOSSIndex - displayMessage:", displayMessage);
  return displayMessage;
};

const styleCVSS = (severity) => {
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

const GetActiveTab = async () => {
  let params = {
    currentWindow: true,
    active: true,
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

const CVSSDetails = (cvssText, version = "3.0") => {
  cvssText = cvssText.toUpperCase();
  console.log("CVSSDetails:" + cvssText);
  var url = "https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator";
  //showNotice:CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
  var cvssTextArray;
  var response = "";
  // console.log("here");
  cvssTextArray = cvssText.split("/");
  console.log("cvssTextArray", cvssTextArray);
  var CR = "<br>";
  var exploitabilityMetrics = "";
  var attackVector = "";
  var attackComplexity = "";
  var privilegesRequired = "";
  var userInteraction = "";
  var scope = "";
  var impactMetrics = "";
  var confidentialityImpact = "";
  var integrityImpact = "";
  var availabilityImpact = "";

  // response += 'Exploitability Metrics' + CR
  // response += 'Impact Metrics' + CR
  //Confidentiality Impact (C)*

  var line = "-";
  var tab = "\t";
  var linebreak = "<hr></hr>";
  var sectionBreak = "<hr></hr>";
  exploitabilityMetrics +=
    "<center><b>" + "Exploitability Metrics" + "</b></center>";
  attackVector += tab + "Attack vector: ";
  attackComplexity += tab + "Attack complexity: ";
  privilegesRequired = tab + "Privileges Required (PR)*: ";
  userInteraction = tab + "User Interaction (UI)*: ";
  scope += tab + "Scope (S)*: ";
  impactMetrics += "<center><b>" + "Impact Metrics" + "</b></center>";
  confidentialityImpact += tab + "Confidentiality Impact (C)*: ";
  integrityImpact += tab + "Integrity Impact (I)*: ";
  availabilityImpact += tab + "Availability Impact (A)*: ";

  cvssTextArray.forEach((element) => {
    // Attack vector
    if (element == "AV:N") {
      attackVector += "Network (AV:N)" + CR.repeat(1);
    }
    if (element == "AV:A") {
      attackVector += "Adjacent Network (AV:N)" + CR.repeat(1);
    }
    if (element == "AV:L") {
      attackVector += "Local (AV:L)" + CR.repeat(1);
    }
    if (element == "AV:P") {
      attackVector += "Physical (AV:P)" + CR.repeat(1);
    }

    // Attack complexity
    if (element == "AC:L") {
      attackComplexity += "Low (AC:L)" + CR.repeat(1);
    }
    if (element == "AC:H") {
      attackComplexity += "High (AC:H)" + CR.repeat(1);
    }
    //Privileges Required (PR)*
    if (element == "PR:N") {
      privilegesRequired += "None (PR:N)" + CR.repeat(1);
    }
    if (element == "PR:L") {
      privilegesRequired += "Low (PR:L)" + CR.repeat(1);
    }
    if (element == "PR:H") {
      privilegesRequired += "High (PR:H)" + CR.repeat(1);
    }
    // User Interaction (UI)*
    if (element == "UI:N") {
      userInteraction += "None (UI:N)" + CR.repeat(1);
    }
    if (element == "UI:R") {
      userInteraction += "Required (UI:R)" + CR.repeat(1);
    }
    // Scope (S)*
    if (element == "S:U") {
      scope += "Unchanged (S:U)" + CR.repeat(1);
    }
    if (element == "S:C") {
      scope += "Changed (S:C)" + CR.repeat(1);
    }

    // Confidentiality Impact (C)*
    if (element == "C:N") {
      confidentialityImpact += "None (C:N)" + CR.repeat(1);
    }
    if (element == "C:L") {
      confidentialityImpact += "Low (C:L)" + CR.repeat(1);
    }
    if (element == "C:H") {
      confidentialityImpact += "High (C:H)" + CR.repeat(1);
    }
    // Integrity Impact (I)*
    if (element == "I:N") {
      integrityImpact += "None (I:N)" + CR.repeat(1);
    }
    if (element == "I:L") {
      integrityImpact += "Low (I:L)" + CR.repeat(1);
    }
    if (element == "I:H") {
      integrityImpact += "High (I:H)" + CR.repeat(1);
    }
    // Availability Impact (A)*
    if (element == "A:N") {
      availabilityImpact += "None (A:N)" + CR.repeat(1);
    }
    if (element == "A:L") {
      availabilityImpact += "Low (A:L)" + CR.repeat(1);
    }
    if (element == "A:H") {
      availabilityImpact += "High (A:H)" + CR.repeat(1);
    }
  });
  let score;
  if (version === "3.0") {
    //@ts-ignore
    score = CVSS.calculateCVSSFromVector(cvssText);
  } else {
    //@ts-ignore
    score = CVSS31.calculateCVSSFromVector(cvssText);
  }
  console.log("score", score);
  //alert(score.baseMetricScore);
  var baseScore = "";
  if (score.success) {
    baseScore += "<center><b>" + "CVSS Score" + "</b></center>";
    baseScore += "Base Score: " + score.baseMetricScore;
    baseScore += ", Impact: " + score.impactMetricScore;
    baseScore += ", Exploitability: " + score.exploitabilityMetricScore;
  }
  response =
    cvssText +
    // CR +
    sectionBreak +
    exploitabilityMetrics +
    attackVector +
    attackComplexity +
    privilegesRequired +
    userInteraction +
    scope +
    sectionBreak +
    impactMetrics +
    confidentialityImpact +
    integrityImpact +
    availabilityImpact +
    sectionBreak +
    baseScore;
  return response;
};

const getUserAgentHeader = () => {
  var nVer = navigator.appVersion;
  var nAgt = navigator.userAgent;
  var browserName = navigator.appName;
  var fullVersion = "" + parseFloat(navigator.appVersion);
  var majorVersion = parseInt(navigator.appVersion, 10);
  var nameOffset, verOffset, ix;
  var environment, environmentVersion, system;
  // In Opera, the true version is after "Opera" or after "Version"
  if ((verOffset = nAgt.indexOf("Opera")) != -1) {
    browserName = "Opera";
    fullVersion = nAgt.substring(verOffset + 6);
    if ((verOffset = nAgt.indexOf("Version")) != -1)
      fullVersion = nAgt.substring(verOffset + 8);
  }
  // In MSIE, the true version is after "MSIE" in userAgent
  else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
    browserName = "Microsoft Internet Explorer";
    fullVersion = nAgt.substring(verOffset + 5);
  }
  // In Chrome, the true version is after "Chrome"
  else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
    browserName = "Chrome";
    fullVersion = nAgt.substring(verOffset + 7);
  }
  // In Safari, the true version is after "Safari" or after "Version"
  else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
    browserName = "Safari";
    fullVersion = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf("Version")) != -1)
      fullVersion = nAgt.substring(verOffset + 8);
  }
  // In Firefox, the true version is after "Firefox"
  else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
    browserName = "Firefox";
    fullVersion = nAgt.substring(verOffset + 8);
  }
  // In most other browsers, "name/version" is at the end of userAgent
  else if (
    (nameOffset = nAgt.lastIndexOf(" ") + 1) <
    (verOffset = nAgt.lastIndexOf("/"))
  ) {
    browserName = nAgt.substring(nameOffset, verOffset);
    fullVersion = nAgt.substring(verOffset + 1);
    if (browserName.toLowerCase() == browserName.toUpperCase()) {
      browserName = navigator.appName;
    }
  }
  // trim the fullVersion string at semicolon/space if present
  if ((ix = fullVersion.indexOf(";")) != -1)
    fullVersion = fullVersion.substring(0, ix);
  if ((ix = fullVersion.indexOf(" ")) != -1)
    fullVersion = fullVersion.substring(0, ix);

  majorVersion = parseInt("" + fullVersion, 10);
  if (isNaN(majorVersion)) {
    fullVersion = "" + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  }

  console.log(
    "" +
      "Browser name  = " +
      browserName +
      "<br>" +
      "Full version  = " +
      fullVersion +
      "<br>" +
      "Major version = " +
      majorVersion +
      "<br>" +
      "navigator.appName = " +
      navigator.appName +
      "<br>" +
      "navigator.userAgent = " +
      navigator.userAgent +
      "<br>"
  );
  environment = browserName;
  environmentVersion = fullVersion;
  system = navigator.appVersion;
  let UserAgentHeader = `Nexus_IQ_Chrome_Extension/${getExtensionVersion()} (${environment} ${environmentVersion}; ${system}; Browser: ${fullVersion})`;

  let agent = {
    environment,
    environmentVersion,
    system,
    UserAgentHeader,
  };
  return;
};

const getExtensionVersion = () => {
  // @ts-ignore
  var version = chrome.app.getDetails().version;
  // var version = chrome.app;
  if (version != undefined) {
    return version;
  } else {
    return "0.0.0";
  }
};

const SetHash = (hash) => {
  artifact.hash = hash;
};
const setHasVulns = (flag) => {
  console.log("hasVulns-before", hasVulns);
  hasVulns = flag;
  console.log("hasVulns-after", hasVulns);
};
const setArtifact = (respMessageArtifact) => {
  artifact = respMessageArtifact;
};

const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
////////////////

const executeScripts = (tabId, injectDetailsArray) => {
  console.log("executeScripts(tabId, injectDetailsArray)", tabId);

  function createCallback(tabId, injectDetails, innerCallback) {
    return function () {
      browser.tabs.executeScript(tabId, injectDetails, innerCallback);
    };
  }

  var callback = null;

  for (var i = injectDetailsArray.length - 1; i >= 0; --i)
    callback = createCallback(tabId, injectDetailsArray[i], callback);

  if (callback !== null) callback(); // execute outermost function
};

const installScripts = async (tab, message) => {
  console.log("begin installScripts", tab, message);
  // var background = browser.extension.getBackgroundPage();
  // background.message = message;
  // console.log("sending message:", message);
  let url = tab.url;
  let scripts = [];
  //hasApprovedNexusRepoUrl
  //nexusRepoUrl
  let repoSettings: any = await GetSettings([
    "hasApprovedNexusRepoUrl",
    "nexusRepoUrl",
    "hasApprovedArtifactoryRepoUrl",
    "artifactoryRepoUrl",
  ]);
  let isNexus = repoSettings.hasApprovedNexusRepoUrl;
  if (isNexus) {
    let theURL = new URL(repoSettings.nexusRepoUrl);
    isNexus = isNexus && url.search(theURL.href) >= 0;
  }

  //https://repo.spring.io/list/jcenter-cache/commons-collections/commons-collections/3.2.1/
  // let isArtifactory =
  //   url.search("webapp") >= 0 || url.search("repo.spring.io/list/") >= 0;

  let isArtifactory = repoSettings.hasApprovedArtifactoryRepoUrl;
  if (isArtifactory) {
    let theURL = new URL(repoSettings.artifactoryRepoUrl);
    isArtifactory = isArtifactory && url.search(theURL.href) >= 0;
    isArtifactory =
      isArtifactory &&
      (url.search("webapp#artifacts") >= 0 || url.search("/ui/repos/") >= 0);
    //artifactory/webapp/#/artifacts
    console.log("url", url, theURL, url.search(theURL.href), isArtifactory);
  }
  isArtifactory = isArtifactory || url.search("repo.spring.io/list/") >= 0;
  console.log("isArtifactory", isArtifactory);
  if (isNexus || isArtifactory) {
    //    // { file: "Scripts/lib/jquery.min.js" },
    // // { file: "Scripts/lib/require.js" },
    // { file: "Scripts/utils.js" },
    // // { code: "var message = " + message  + ";"},
    // { file: "Scripts/content.js" },
    // scripts.push({
    //   file: "scripts/lib/jquery.min.js",
    // });
    scripts.push({
      file: "scripts/vendor.js",
    });
    scripts.push({
      file: "scripts/content.js",
    });
  }

  // scripts.push({
  //   code: "processPage();",
  // });
  executeScripts(null, [
    { file: "scripts/lib/jquery.min.js" },
    // { file: "scripts/utils_original.js" },
    // { code: "var message = " + message  + ";"},
    { file: "scripts/vendor.js" },
    // { file: "scripts/lib/jquery-ui-1.12.1/jquery-ui.min.js" },

    { file: "scripts/content.js" },
    { code: "processPage();" },
  ]);
  console.log("Injecting scripts", scripts);
  executeScripts(null, scripts);
  // browser.tabs.sendMessage(tab.tabId, message);
  // browser.runtime.sendMessage(message);
  console.log("end installScripts");
};
/////////////
function validateUrl(url) {
  let testUrl;
  let retVal = false;
  try {
    testUrl = new URL(url);
    retVal = true;
  } catch {
    retVal = false;
  }
  return retVal;
}

export {
  addCookies,
  artifact,
  addDataOSSIndex,
  beginEvaluation,
  // BuildEmptySettings,
  BuildSettings,
  BuildSettingsFromGlobal,
  callServer,
  ChangeIconMessage,
  checkAllPermissions,
  CVSSDetails,
  encodeComponentIdentifier,
  evaluateComponent,
  evaluatePackage,
  GetActiveTab,
  GetAllVersions,
  GetCookie,
  GetCVEDetails,
  GetSettings,
  getDomainName,
  getExtensionVersion,
  getRemediation,
  getUserAgentHeader,
  //Page parsers
  ParsePage,
  removeCookies,
  // repoTypes,
  // findRepoType,
  SetHash,
  setHasVulns,
  setArtifact,
  setSettings,
  styleCVSS,
  validateUrl,
  xsrfCookieName,
  xsrfHeaderName,
  uuidv4,
  canLogin,
  nexusArtifact,
  settings,
  hasVulns,
  GetAllApplications,
  valueCSRF,
  extractHostname,
  masterSettingsList,
  identifyComponent,
};
