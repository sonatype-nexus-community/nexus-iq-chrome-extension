/*jslint es6  -W024 */
"use strict";

console.log("utils.js");
var artifact, nexusArtifact, hasVulns, settings;
var valueCSRF;

var xsrfCookieName = "CLM-CSRF-TOKEN";
var xsrfHeaderName = "X-CSRF-TOKEN";

var browser;
if (typeof chrome !== "undefined") {
  browser = chrome;
}

var formats = {
  maven: "maven",
  npm: "npm",
  nuget: "nuget",
  gem: "gem",
  pypi: "pypi",
  composer: "composer", //packagist website but composer format
  cocoapods: "cocoapods",
  cran: "cran",
  cargo: "cargo", //cargo == crates == rust
  golang: "golang",
  github: "github",
  rpm: "rpm",
};

//This is the format in nexus repo for proxy repos
var nexusRepoformats = {
  maven: "maven2",
  npm: "npm",
  nuget: "nuget",
  gem: "rubygems",
  pypi: "pypi",
};

//This is the format in artifactory repo for proxy repos
var artifactoryRepoformats = {
  maven: "maven2",
  npm: "npm",
  nuget: "nuget",
  gem: "rubygems",
  pypi: "pypi",
};

var dataSources = {
  NEXUSIQ: "NEXUSIQ",
  OSSINDEX: "OSSINDEX",
};

var messageTypes = {
  login: "login", //message to send that we are in the process of logging in
  evaluate: "evaluate", //message to send that we are evaluating
  loggedIn: "loggedIn", //message to send that we are in the loggedin
  displayMessage: "displayMessage", //message to send that we have data from REST and wish to display it
  loginFailedMessage: "loginFailedMessage", //message to send that login failed
  beginEvaluate: "beginEvaluate", //message to send that we are beginning the evaluation process, it's different to the evaluatew message for a readon that TODO I fgogot
  artifact: "artifact", //passing a artifact/package identifier from content to the background to kick off the eval
  evaluateComponent: "evaluateComponent", //used to evaluate on the popup only
  vulnerability: "vulnerability", // vuln scan results

  error: "error", //used to pass errors from background and content script to the popup

  annotateComponent: "annotateComponent",
};
class Component {
  constructor(hash) {}
}

class ComponentIdentifier {
  constructor(format, coordinates) {}
}
class Coordinates {
  constructor() {}
  display() {
    return undefined;
  }
}
class NPMCoordinates extends Coordinates {
  constructor(packageId, version) {
    super();
  }
  display() {
    return `${this.packageId}:${this.version}`;
  }
}

class MavenCoordinates extends Coordinates {
  constructor(groupId, artifactId, version) {
    // console.log("groupId", groupId);
    super();
    this.groupId = groupId;
    this.artifactId = artifactId;
    this.version = version;
  }
  display() {
    console.log("groupId", this.groupId);
    return `<tr>
                            <td class="label">Group:</td>
                            <td class="data"><span id="group">${this.groupId}</span></td>
                        </tr>
                        <tr>
                            <td class="label">Artifact:</td>
                            <td class="data"><span id="artifact">${this.artifactId}</span></td>
                        </tr>                        
                        <tr>
                            <td class="label">Version:</td>
                            <td class="data"><span id="version">${this.version}</span></td>
                        </tr>`;
  }
}

class Artifact {
  constructor(format, hash, datasource) {
    this.format = format;
    this.hash = hash;
    this.datasource = datasource;
  }
  //I have a few properties
  //the hash is not always known
  display() {
    return this.format;
  }
  set hash(value) {
    this._hash = value;
  }
  get hash() {
    return this._hash;
  }
  set datasource(value) {
    this._datasource = value;
  }
  get datasource() {
    return this._datasource;
  }
  set format(value) {
    this._format = value;
  }
  get format() {
    return this._format;
  }
}
class MavenArtifact extends Artifact {
  constructor(groupId, artifactId, version, extension, classifier) {
    let _format = formats.maven;
    let _hash = null;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, _hash, _datasource);
    this.groupId = groupId;
    this.artifactId = artifactId;
    this.version = version;
    this.extension = extension;
    this.classifier = classifier;
    // this.format = formats.maven;
    // this.hash = null;
    // this.datasource = dataSources.NEXUSIQ;
  }
}
class NPMArtifact extends Artifact {
  constructor(packageName, version) {
    let _format = formats.npm;
    let _hash = null;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, _hash, _datasource);

    // this.format = format;
    // this.hash = hash;
    // this.datasource = datasource;
    this.packageName = packageName;
    this.version = version;
  }
  display() {
    return this.packageId;
  }
}
class NugetArtifact extends Artifact {
  constructor(packageId, version) {
    let _format = formats.nuget;
    let _hash = null;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, _hash, _datasource);

    this.packageId = packageId;
    this.version = version;
  }
  display() {
    return this.packageId;
  }
}
class PyPIArtifact extends Artifact {
  //Pypi
  // name: artifact.name,
  // qualifier: artifact.qualifier || "py2.py3-none-any",
  // version: artifact.version,
  // extension: artifact.extension || "whl"

  constructor(name, version, qualifier, extension) {
    let _format = formats.pypi;
    let _hash = null;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, _hash, _datasource);

    this.name = name;
    this.version = version;
    // this.qualifier = qualifier;
    // this.extension = extension;
    this.extension = "tar.gz";
    this.qualifier = "";
  }
  display() {
    return this.name;
  }
}

const checkPageIsHandled = (url) => {
  console.log("checkPageIsHandled", url);
  //check the url of the tab is in this collection
  // let url = tab.url
  let found = false;
  if (
    url.search("https://search.maven.org/artifact/") >= 0 ||
    url.search("https://mvnrepository.com/artifact/") >= 0 ||
    url.search("https://repo1.maven.org/maven2/") >= 0 ||
    url.search("https://repo.maven.apache.org/maven2/") >= 0 ||
    url.search("https://www.npmjs.com/package/") >= 0 ||
    url.search("https://www.nuget.org/packages/") >= 0 ||
    url.search("https://pypi.org/project/") >= 0 ||
    url.search("https://packagist.org/packages/") >= 0 ||
    url.search("https://rubygems.org/gems/") >= 0 ||
    url.search("https://cran.r-project.org/") >= 0 ||
    url.search("https://crates.io/") >= 0 ||
    url.search("https://search.gocenter.io/") >= 0 ||
    (url.search("https://github.com/") >= 0 &&
      url.search("/releases/tag/") >= 0) || //https://github.com/jquery/jquery/releases/tag/3.0.0
    url.search("/webapp/#/artifacts/") >= 0 || //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/us-remote/antlr/antlr/2.7.1/antlr-2.7.1.jar
    url.search("/list/") >= 0 || //https://repo.spring.io/list/jcenter-cache/org/cloudfoundry/cf-maven-plugin/1.1.3/
    url.search("/#browse/browse:") >= 0 || //http://nexus:8081/#browse/browse:maven-central:antlr%2Fantlr%2F2.7.2
    url.search("https://rpmfind.net/linux/RPM/epel/7/") >= 0 ||
    url.search("https://cocoapods.org/pods/") >= 0 ||
    false
  ) {
    found = true;
  }
  return found;
};

const ParsePageURL = (url) => {
  //artifact varies depending on eco-system
  //returns an artifact if URL contains the version
  //if it is not a version specific URL then returns a falsy value
  console.log("ParsePageURL", url);
  //who I am what is my address?
  let artifact; // = new Artifact();
  let format;

  if (url.search("search.maven.org/artifact/") >= 0) {
    //https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar
    format = formats.maven;
    artifact = parseMavenURL(url);
  } else if (url.search("https://mvnrepository.com/artifact/") >= 0) {
    //https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
    format = formats.maven;
    artifact = parseMavenURL(url);
  } else if (url.search("https://repo1.maven.org/maven2/") >= 0) {
    //https://repo1.maven.org/maven2/commons-collections/commons-collections/3.2.1/
    format = formats.maven;
    artifact = parseMavenURL(url);
  } else if (url.search("https://repo.maven.apache.org/maven2/") >= 0) {
    //can not be parsed need to inject script and parse html
    //https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2.1/
    format = formats.maven;
    artifact = parseMavenURL(url);
  } else if (url.search("www.npmjs.com/package/") >= 0) {
    //'https://www.npmjs.com/package/lodash'};
    format = formats.npm;
    //artifact = new NPMArtifact();
    artifact = parseNPMURL(url);
  } else if (url.search("https://www.nuget.org/packages/") >= 0) {
    //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
    format = formats.nuget;
    artifact = parseNugetURL(url);
  }
  //pypi url can not be parsed now, as i need to read the html to determine the extension and qualifier
  else if (url.search("pypi.org/project/") >= 0) {
    //https://pypi.org/project/Django/1.6/
    format = formats.pypi;
    artifact = null;
  } else if (
    url.search("rubygems.org/gems/") >= 0 &&
    url.search("/versions/") >= 0
  ) {
    //https://rubygems.org/gems/bundler/versions/1.16.1
    format = formats.gem;
    artifact = parseRubyURL(url);
  }
  //OSSIndex/php
  else if (url.search("packagist.org/packages/") >= 0) {
    //https: packagist ???
    format = formats.composer;
    artifact = parsePackagistURL(url);
  } else if (url.search("cocoapods.org/pods/") >= 0) {
    //https:// cocoapods ???
    format = formats.cocoapods;
    artifact = parseCocoaPodsURL(url);
  } else if (url.search("cran.r-project.org/") >= 0) {
    format = formats.cran;
    artifact = parseCRANURL(url);
  } else if (url.search("https://crates.io/crates/") >= 0) {
    format = formats.cargo;
    artifact = parseCratesURL(url);
  } else if (url.search("https://search.gocenter.io/") >= 0) {
    format = formats.golang;
    artifact = parseGoLangURL(url);
  }
  //https://github.com/jquery/jquery/releases/tag/3.0.0
  else if (url.search("https://github.com/") >= 0) {
    format = formats.github;
    artifact = parseGitHubURL(url);
  }
  //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/us-remote/antlr/antlr/2.7.1/antlr-2.7.1.jar
  //https://repo.spring.io/list/jcenter-cache/org/cloudfoundry/cf-maven-plugin/1.1.3/
  else if (url.search("webapp/#/artifacts") >= 0 || url.search("/list/") >= 0) {
    artifact = parseArtifactoryURL(url);
  }
  //nexus Repo
  // http://nexus:8081/#browse/browse:maven-central:antlr%2Fantlr%2F2.7.2
  else if (url.search("#browse/browse:") >= 0) {
    artifact = parseNexusRepoURL(url);
  } else if (url.search("https://rpmfind.net/linux/RPM/epel/") >= 0) {
    artifact = parseRPMRepoURL(url);
  }

  console.log("ParsePageURL Complete. artifact:", artifact);
  //now we write this to background as
  //we pass variables through background
  return artifact;
};

const BuildEmptySettings = () => {
  let settings = {
    username: "",
    password: "",
    tok: "",
    hash: "",
    auth: "",
    restEndPoint: "",
    baseURL: "",
    url: "",
    loginEndPoint: "",
    loginurl: "",
  };
  return settings;
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

function extractHostname(url) {
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
}

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

const NexusFormat = (artifact) => {
  console.log("NexusFormat", artifact);
  let format = artifact.format;
  let requestdata;
  switch (format) {
    case formats.maven:
      requestdata = NexusFormatMaven(artifact);
      break;
    case formats.npm:
      requestdata = NexusFormatNPM(artifact);
      break;
    case formats.nuget:
      requestdata = NexusFormatNuget(artifact);
      break;
    case formats.pypi:
      requestdata = NexusFormatPyPI(artifact);
      break;
    case formats.gem:
      requestdata = NexusFormatRuby(artifact);
      break;
    case formats.golang:
      requestdata = NexusFormatGolang(artifact);
      break;
    case formats.rpm:
      requestdata = NexusFormatRPM(artifact);
      break;

    default:
      console.log("Unexpected format", format);
      return;
  }
  return requestdata;
};

const NexusFormatMaven = (artifact) => {
  //return a dictionary in Nexus Format
  //return dictionary of components
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            groupId: artifact.groupId,
            artifactId: artifact.artifactId,
            version: artifact.version,
            extension: artifact.extension,
            classifier: "",
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatNPM = (artifact) => {
  //return a dictionary in Nexus Format
  //return dictionary of components
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            packageId: artifact.packageName,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatNuget = (artifact) => {
  //return a dictionary in Nexus Format ofr Nuget
  //return dictionary of components
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            packageId: artifact.packageId,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatPyPI = (artifact) => {
  //Python -> pypi
  //return a dictionary in Nexus Format
  //return dictionary of components
  //TODO: how to determine the qualifier and the extension??
  let component;
  //artifact.qualifier || "py2.py3-none-any"
  //artifact.extension = "whl";
  // artifact.extension = "zip";
  // artifact.qualifier = "";

  let componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: artifact.name,
            qualifier: artifact.qualifier,
            version: artifact.version,
            extension: artifact.extension,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatRuby = (artifact) => {
  //return a dictionary in Nexus Format
  //return dictionary of components
  //TODO: how to determine the qualifier and the extension??
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: artifact.name,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatGolang = (artifact) => {
  //return a dictionary in Nexus Format
  //return dictionary of components
  // "name": "github.com/gorilla/mux",
  //"version": "v1.7.0"
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: `${artifact.type}/${artifact.namespace}/${artifact.name}`,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatRPM = (artifact) => {
  //return a dictionary in Nexus Format
  //return dictionary of components
  // "name": "github.com/gorilla/mux",
  //"version": "v1.7.0"
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: `${artifact.name}`,
            version: artifact.version,
            architecture: artifact.architecture,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const encodeComponentIdentifier = (component) => {
  let actual = encodeURIComponent(
    JSON.stringify(component.componentIdentifier)
  );
  console.log(actual);
  return actual;
};

const epochToJsDate = (ts) => {
  // ts = epoch timestamp
  // returns date obj
  return new Date(ts * 1000);
};
const jsDateToEpoch = (d) => {
  // d = javascript date obj
  // returns epoch timestamp
  console.log(d);
  if (!(d instanceof Date)) {
    throw new TypeError("Bad date passed in");
  } else {
    return (d.getTime() - d.getMilliseconds()) / 1000;
  }
};
const parseCocoaPodsURL = (url) => {
  console.log("parseCocoaPodsURL");
  let format = formats.cocoapods;
  let datasource = dataSources.OSSINDEX;

  // var elements = url.split('/')
  //https://cocoapods.org/pods/TestFairy
  //no version number in the URL
  return false;
};

const parseCRANURL = (url) => {
  //https://cran.r-project.org/
  // https://cran.r-project.org/web/packages/latte/index.html
  //https://cran.r-project.org/package=clustcurv
  //no version ATM
  let format = formats.cocoapods;
  let datasource = dataSources.OSSINDEX;

  return false;
};

const parseGoLangURL = (url) => {
  //https://gocenter.jfrog.com/github.com~2Fhansrodtang~2Frandomcolor/versions
  //https://search.gocenter.io/github.com~2Fbazelbuild~2Fbazel-integration-testing/versions
  let format = formats.golang;
  let datasource = dataSources.NEXUSIQ;
  return false;
};

const parseGitHubURL = (url) => {
  console.log("parseGitHubURL", url);
  //https://github.com/jquery/jquery/releases/tag/3.0.0
  let format = formats.github;
  let datasource = dataSources.OSSINDEX;

  let packageName;
  let version;
  let artifact = "";
  if (url.search("/releases/tag/") > 0) {
    //has version in URL
    var urlElements = url.split("/");
    if (urlElements.length >= 8) {
      packageName = urlElements[3] + "/" + urlElements[4];
      version = urlElements[7];
    } else {
      packageName = urlElements[4];
      version = urlElements[6];
    }
    artifact = {
      format: format,
      name: packageName,
      version: version,
      datasource: datasource,
    };
  } else {
    artifact = "";
    return false;
  }
  console.log("artifact", artifact);
  return artifact;
};

const parseMavenURL = (url) => {
  console.log("parseMavenURL:", url);

  //maven repo https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
  //SEARCH      https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar
  //https://repo1.maven.org/maven2/commons-collections/commons-collections/3.2.1/
  //https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2.1/
  //https://repo1.maven.org/maven2/com/github/jedis-lock/jedis-lock/1.0.0/
  //CURRENTLY both have the same format in the URL version, except maven central also has the packaging type
  let format = formats.maven;
  let datasource = dataSources.NEXUSIQ;

  let elements = url.split("/");
  let groupId = "";
  let artifactId = "";
  let version = "";
  let extension = "";
  let classifier = "";
  if (elements.length >= 9) {
    //then we have a massive groupid in the url
    let el = "";
    while (el == "") {
      el = elements.pop();
    }
    version = el;
    artifactId = elements.pop();
    el = "";
    console.log("groupId:", groupId);
    while (el != "maven2") {
      if (groupId !== "") {
        groupId = el + "." + groupId;
      } else {
        groupId = el;
      }
      el = elements.pop();
    }
  } else {
    groupId = elements[4];
    artifactId = elements[5];
    version = elements[6];
    extension = elements[7];
  }
  //  packageName=url.substr(url.lastIndexOf('/')+1);
  groupId = encodeURIComponent(groupId);
  artifactId = encodeURIComponent(artifactId);
  version = encodeURIComponent(version);
  if (
    typeof extension === "undefined" ||
    extension === "bundle" ||
    extension === ""
  ) {
    //mvnrepository doesnt have it
    extension = "jar";
  }
  extension = encodeURIComponent(extension);
  classifier = "";
  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );
  return artifact;
};

const parseNPMURL = (url) => {
  //ADD SIMPLE CODE THAT Check THE URL
  //this is run outside of the content page
  //so can not see the dom
  //need to handle when the component has a slash in the name
  //https://www.npmjs.com/package/@angular/animation/v/4.0.0-beta.8
  let format = formats.npm;
  let datasource = dataSources.NEXUSIQ;
  let hash;
  let packageName;
  let version;
  let artifact = "";
  if (url.search("/v/") > 0) {
    //has version in URL
    var urlElements = url.split("/");
    if (urlElements.length >= 8) {
      packageName = urlElements[4] + "/" + urlElements[5];
      version = urlElements[7];
    } else {
      packageName = urlElements[4];
      version = urlElements[6];
    }
    let rartifact = new NPMArtifact(
      packageName,
      version,
      format,
      hash,
      datasource
    );
    artifact = rartifact;
    // artifact = {
    //   format: format,
    //   packageName: packageName,
    //   version: version,
    //   datasource: datasource
    // };
  } else {
    artifact = "";
  }
  return artifact;
};

const parseNugetURL = (url) => {
  //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
  let format = formats.nuget;
  let datasource = dataSources.NEXUSIQ;
  let packageId, version, artifact;
  var elements = url.split("/");
  if (elements.length == 6) {
    packageId = elements[4];
    //  packageName=url.substr(url.lastIndexOf('/')+1);
    version = elements[5];
    packageId = encodeURIComponent(packageId);
    version = encodeURIComponent(version);
    artifact = {
      format: format,
      packageId: packageId,
      version: version,
      datasource: datasource,
    };
  } else {
    artifact = "";
  }
  return artifact;
};

const parsePackagistURL = (url) => {
  //server is packagist, format is composer
  console.log("parsePackagist:" + url);
  const elements = url.split("/");
  let format = formats.composer;
  let datasource = dataSources.OSSINDEX;

  let artifact;
  let name;
  let version;
  //https://packagist.org/packages/drupal/drupal
  //Specific version is with a hash
  //https://packagist.org/packages/drupal/drupal#8.6.2
  //https://packagist.org/packages/phpbb/phpbb#3.1.2
  let namePt1 = elements[4];
  let namePt2 = elements[5];

  let whereIs = namePt2.search("#");
  //is the version number in the URL? if so get that, else get it from the HTML
  //can only parse the DOM from content script
  //so this script will return falsy
  if (whereIs > -1) {
    version = namePt2.substr(whereIs + 1);
    namePt2 = namePt2.substr(0, whereIs);
    name = namePt1 + "/" + namePt2;
    name = encodeURIComponent(name);
    version = encodeURIComponent(version);
    artifact = {
      format: format,
      datasource: datasource,
      name: name,
      version: version,
    };
  } else {
    //return falsy
    artifact = "";
  }
  return artifact;
};
const parsePyPIURL = (url) => {
  console.log("parsePyPI");
  //https://pypi.org/project/Django/1.6/
  //return falsy if no version in the URL
  let format = formats.pypi;
  let datasource = dataSources.NEXUSIQ;

  let elements = url.split("/");
  let artifact;
  // let extension = "whl";
  // let qualifier = "py2.py3-none-any";
  let extension = "";
  let qualifier = "";

  let name, version;

  if (elements[5] == "") {
    artifact = "";
  } else {
    name = elements[4];
    //  packageName=url.substr(url.lastIndexOf('/')+1);
    version = elements[5];
    name = encodeURIComponent(name);
    version = encodeURIComponent(version);
    artifact = {
      format: format,
      name: name,
      version: version,
      datasource: datasource,
      extension: extension,
      qualifier: qualifier,
    };
  }
  return artifact;
};

const parseRubyURL = (url) => {
  console.log("parseRubyURL");
  let format = formats.gem;
  let datasource = dataSources.NEXUSIQ;
  let name, version;
  let elements = url.split("/");
  let artifact;
  if (elements.length < 6) {
    //current version is inside the dom
    //https://rubygems.org/gems/bundler
    //return falsy
    artifact = "";
  } else {
    //https://rubygems.org/gems/bundler/versions/1.16.1
    name = elements[4];
    version = elements[6];
    name = encodeURIComponent(name);
    version = encodeURIComponent(version);
    artifact = {
      format: format,
      name: name,
      version: version,
      datasource: datasource,
    };
  }
  return artifact;
};

const parseNexusRepoURL = (url) => {
  console.log("parseNexusRepoURL", url);
  return undefined;
  //http://nexus:8081/#browse/browse:maven-central:antlr%2Fantlr%2F2.7.2
  //http://nexus:8081/#browse/browse:npm-proxy:%40akryum%2Fwinattr%2Fwinattr-3.0.0.tgz
  //http://nexus:8081/#browse/search=keyword%3Dlodash:2a59043ed2ea556e86a68efbf920b14d:40292acdebc01b836aa6c0988697aca5
  //http://nexus:8081/#browse/browse:npm-proxy:lodash%2Flodash-4.17.9.tgz
  //pypi
  // http://nexus:8081/#browse/browse:pypi-proxy:abodepy%2F0.15.0%2Fabodepy-0.15.0-py3-none-any.whl
  let artifact;
  let elements = url.split("/");
  let browseElement = elements[elements.length - 1]; //last item
  let browseElements = browseElement.split(":");
  let groupEls = browseElements[2].split("%2F");
  let format = formats.maven;
  //"abodepy%2F0.15.0%2Fabodepy-0.15.0-py3-none-any.whl"
  if (groupEls.length == 3 && groupEls[2].endsWith(".whl")) {
    //I will deem this as pypi
    format = formats.pypi;
  } else if (groupEls[1].search("-") > -1) {
    //I will deem this as npm
    format = formats.npm;
  }
  if (format === formats.pypi) {
    let fileName = groupEls[2];
    let name = groupEls[0];
    name = encodeURIComponent(name);
    let version = groupEls[1];
    version = encodeURIComponent(version);
    let datasource = dataSources.NEXUSIQ;
    artifact = {
      format: format,
      name: name,
      version: version,
      datasource: datasource,
    };
  }
  if (format === formats.npm) {
    let fileName = groupEls[1];
    let packageName;
    let version;
    packageName = fileName.substring(0, fileName.search("-"));
    version = fileName.substring(
      fileName.search("-") + 1,
      fileName.lastIndexOf(".")
    );
    let datasource = dataSources.NEXUSIQ;
    artifact = {
      format: format,
      packageName: packageName,
      version: version,
      datasource: datasource,
    };
  }

  if (format === formats.maven) {
    let groupId;
    let artifactId;
    let version;
    let extension;

    let classifier = "";
    let datasource = dataSources.NEXUSIQ;

    groupId = groupEls[0];
    artifactId = groupEls[1];
    version = groupEls[2];
    extension = "jar";

    groupId = encodeURIComponent(groupId);
    artifactId = encodeURIComponent(artifactId);
    version = encodeURIComponent(version);
    extension = encodeURIComponent(extension);
    artifact = {
      format: format,
      groupId: groupId,
      artifactId: artifactId,
      version: version,
      extension: extension,
      classifier: classifier,
      datasource: datasource,
    };
  }
  return artifact;
};

const parseArtifactoryURL = (url) => {
  console.log("parseArtifactoryURL", url);
  //java object
  //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/us-remote/antlr/antlr/2.7.1/antlr-2.7.1.jar
  //npm object
  // https://repo.spring.io/webapp/#/artifacts/browse/tree/General/npmjs-cache/parseurl/-/parseurl-1.0.1.tgz
  //java
  //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/spring-release-cache/org/springframework/spring-core/4.1.7.RELEASE
  //compare this to
  //https://search.maven.org/artifact/org.springframework/spring-core/4.1.7.RELEASE/jar
  //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/spring-release-cache/org/cloudfoundry/cf-maven-plugin/1.1.4.RELEASE/cf-maven-plugin-1.1.4.RELEASE.jar
  //https://repo.spring.io/list/jcenter-cache/org/cloudfoundry/cf-maven-plugin/1.1.3/

  let elements = url.split("/");
  let format = formats.maven;
  let datasource = dataSources.NEXUSIQ;
  let artifact;
  var found = elements.find((element) => {
    return element === "-";
  });
  if (found) {
    //npm
    format = formats.npm;
    datasource = dataSources.NEXUSIQ;
  } else {
    //maven
    format = formats.maven;
    datasource = dataSources.NEXUSIQ;
  }
  //now lets iterate through the elements of the URL
  //when we find the # we are at the root of the path
  let baseIndex = 0;
  let groupIdIndex = 0;
  let artifactIdIndex = 0;
  let versionIndex = 0;
  let extensionIndex = 0;
  let packageNameIndex = 0;
  let repoIndex = 0;

  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    if (element === "#") {
      //we are at the base offset
      //now this can be tricky
      //repository will be the 5th element after #

      baseIndex = index;
      repoIndex = baseIndex + 5;
      break;
    }
    if (element === "list") {
      //https://repo.spring.io/list/jcenter-cache/org/cloudfoundry/cf-maven-plugin/1.1.3/
      //we are at the base offset
      baseIndex = index;
      repoIndex = baseIndex + 1;
      break;
    }
  }
  console.log("format", format, baseIndex, repoIndex, elements.length);
  if (format === formats.npm) {
    packageNameIndex = repoIndex + 1;
    versionIndex = packageNameIndex + 2;

    let packageName;
    let version;

    packageName = elements[packageNameIndex];
    let fileName = elements[versionIndex];
    version = fileName.substring(
      fileName.search("-") + 1,
      fileName.lastIndexOf(".")
    );
    artifact = {
      format: format,
      packageName: packageName,
      version: version,
      datasource: datasource,
    };
  } else if (format === formats.maven) {
    let lastElementIsFileName = false;
    if (elements[elements.length - 1].search(/[.][a-z]ar/) > -1) {
      //last element is the filename
      //"cf-maven-plugin-1.1.4.RELEASE.jar"
      lastElementIsFileName = true;
    }
    //work out how many elements there are in the group/artifact/version section
    let numElements = elements.length - repoIndex - 1;
    //if there are 5 and the last element is a filename
    //then first 2 elements are the group
    //3rd is the artifact
    //4th is the name
    let groupId;
    let artifactId;
    let version;
    let extension;
    //group can be in two parts
    groupIdIndex = repoIndex + 1;
    artifactIdIndex = groupIdIndex + 1;
    versionIndex = artifactIdIndex + 1;
    extensionIndex = versionIndex + 1;

    console.log("here", numElements, lastElementIsFileName);
    if (numElements === 5 && lastElementIsFileName) {
      //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/spring-release-cache/org/cloudfoundry/cf-maven-plugin/1.1.4.RELEASE/cf-maven-plugin-1.1.4.RELEASE.jar"
      groupIdIndex = repoIndex + 1;
      artifactIdIndex = groupIdIndex + 2;
      versionIndex = artifactIdIndex + 1;
      extensionIndex = versionIndex + 1;

      groupId = elements[groupIdIndex] + "." + elements[groupIdIndex + 1];
      artifactId = elements[artifactIdIndex];
      version = elements[versionIndex];
      extension = elements[extensionIndex];
      extension = extension.substring(
        extension.lastIndexOf(".") + 1,
        extension.length
      );
    } else if (numElements === 5 && !lastElementIsFileName) {
      //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/spring-release-cache/org/springframework/spring-core/4.1.7.RELEASE
      groupIdIndex = repoIndex + 1;
      artifactIdIndex = groupIdIndex + 2;
      versionIndex = artifactIdIndex + 1;
      extensionIndex = versionIndex + 1;

      groupId = elements[groupIdIndex] + "." + elements[groupIdIndex + 1];
      artifactId = elements[artifactIdIndex];
      version = elements[versionIndex];
      extension = "jar";
    } else if (numElements == 4 && lastElementIsFileName) {
      //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/us-remote/antlr/antlr/2.7.1/antlr-2.7.1.jar
      groupId = elements[groupIdIndex];
      artifactId = elements[artifactIdIndex];
      version = elements[versionIndex];
      extension = elements[extensionIndex];
      extension = extension.substring(
        extension.lastIndexOf(".") + 1,
        extension.length
      );
    } else if (numElements == 4 && !lastElementIsFileName) {
      //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/spring-release-cache/org/springframework/spring-core/4.1.7.RELEASE
      groupId = elements[groupIdIndex] + "." + elements[groupIdIndex + 1];
      artifactIdIndex = groupIdIndex + 2;
      artifactId = elements[artifactIdIndex];
      versionIndex = artifactIdIndex + 1;
      version = elements[versionIndex];
      extension = "jar";
    }

    groupId = encodeURIComponent(groupId);
    artifactId = encodeURIComponent(artifactId);
    version = encodeURIComponent(version);
    extension = encodeURIComponent(extension);
    let classifier = "";
    artifact = {
      format: format,
      groupId: groupId,
      artifactId: artifactId,
      version: version,
      extension: extension,
      classifier: classifier,
      datasource: datasource,
    };
  }
  console.log("artifact", artifact);
  return artifact;
};
/////////////////////////

const parseRPMRepoURL = (url) => {
  console.log("parseRPMRepoURL", url);
  //https://rpmfind.net/linux/RPM/epel/7/aarch64/Packages/m/mysql-proxy-0.8.5-2.el7.aarch64.html
  let format = formats.rpm;
  let datasource = dataSources.NEXUSIQ;
  let name, version, architecture;
  //11 components
  let elements = url.split("/");
  let artifact;
  if (elements.length < 6) {
    //current version is inside the dom

    //return falsy
    artifact = "";
  } else {
    //https://rpmfind.net/linux/RPM/epel/7/aarch64/Packages/m/mysql-proxy-0.8.5-2.el7.aarch64.html
    name = "mysql-proxy"; //elements[10];
    version = "0.8.5-2.el7"; //elements[10];
    architecture = "x86_64";
    name = encodeURIComponent(name);
    version = encodeURIComponent(version);
    artifact = {
      format: format,
      name: name,
      version: version,
      architecture: architecture,
      datasource: datasource,
    };
  }
  return artifact;
};
////////////////////////
////////Parse DOM/////////

function parseNPM(format, url) {
  //ADD SIMPLE CODE THAT CHECLS THE URL?
  //note that this changed as of 19/03/19
  //version in URL
  //https://www.npmjs.com/package/lodash/v/4.17.9
  //No version in URL so read DOM
  //https://www.npmjs.com/package/lodash/
  let doc = $("html")[0].outerHTML;
  // let docelements = $(doc);

  let found;
  let newV;
  let elements;
  let packageName;
  let version;
  if (url.search("/v/") > 0) {
    //has version in URL
    var urlElements = url.split("/");
    packageName = urlElements[4];
    version = urlElements[6];
  } else {
    //try to parse the URL
    //Seems like node has changed their selector
    //var found = $('h1.package-name-redundant', doc);
    // found = $('h1.package-name-redundant', doc);
    found = $("h2 span");
    console.log("h2 span found", found);
    if (typeof found !== "undefined" && found !== "") {
      packageName = found.text().trim();
      // let foundV = $("h2", doc);
      //https://www.npmjs.com/package/jest
      newV = $("h2").next("span");
      if (typeof newV !== "undefined" && newV !== "") {
        newV = newV.text();
        //produces "24.5.0 • "
        let findnbsp = newV.search(String.fromCharCode(160));
        if (findnbsp >= 0) {
          newV = newV.substring(0, findnbsp);
        }
        version = newV;
      }
      console.log("newV:", newV);
    }
  }
  //
  //  packageName=url.substr(url.lastIndexOf('/')+1);
  packageName = encodeURIComponent(packageName);
  version = encodeURIComponent(version);
  let datasource = dataSources.NEXUSIQ;
  return {
    format: format,
    packageName: packageName,
    version: version,
    datasource: datasource,
  };
}

const BuildSettings = (baseURL, username, password, appId, appInternalId) => {
  //let settings = {};
  console.log("BuildSettings");
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
  };
  return settings;
};

const BuildSettingsFromGlobal = async () => {
  console.log("BuildSettingsFromGlobal");
  let promise = await GetSettings([
    "url",
    "username",
    "password",
    "appId",
    "appInternalId",
  ]);
  settings = BuildSettings(
    promise.url,
    promise.username,
    promise.password,
    promise.appId,
    promise.appInternalId
  );
  console.log("settings", settings);
  return settings;
};

const GetSettings = (keys) => {
  let promise = new Promise((resolve, reject) => {
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

const GetCookie = (domain, xsrfCookieName) => {
  console.log("GetCookie", domain, xsrfCookieName);
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
          resolve(cookies[0]);
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
  console.log("evaluatePackage - displayMessage", displayMessage);

  return displayMessage;
};

/////////////

////////////////

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
        installScripts(tab, message);
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
  let cookie = await GetCookie(domain, xsrfCookieName);
  console.log("cookie", cookie);
  if (typeof cookie === "undefined") {
    console.log("handled missing cookie");

    valueCSRF = uuidv4();
    //server is not up most probably
    //do we throw an error here or exit gracefully
    // throw new Error(
    //   `Cookie: ${xsrfCookieName} not available. Server ${servername} is probably down, or you will have to set the csrfProtection setting in Config.yml`
    // );
    // return;
  } else {
    valueCSRF = cookie.value;
  }
  let displayMessage = await callServer(valueCSRF, artifact, settings);
  return displayMessage;
  // } catch (error) {
  //   console.log("evaluatePackage-Error", error);
  //   throw error;
  // } finally {
  //   console.log("evaluatePackage-finally");
  // }
};

const getRemediation = async (nexusArtifact, settings) => {
  console.log("getRemediation", nexusArtifact, settings);
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

const GetAllVersions = async (nexusArtifact, settings, remediation) => {
  console.log("GetAllVersions", nexusArtifact, settings, remediation);
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

const parseCratesURL = (url) => {
  //server is crates, language is rust
  //https://crates.io/crates/rand
  //no version in the URL
  let format = formats.cargo;
  let datasource = dataSources.OSSINDEX;

  return false;
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

const CVSSDetails = (cvssText) => {
  cvssText = cvssText.toUpperCase();
  console.log("CVSSDetails:" + cvssText);
  var url = "https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator";
  //showNotice:CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
  var cvssTextArray;
  var response = "";
  console.log("here");
  cvssTextArray = cvssText.split("/");
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
  var score = CVSS.calculateCVSSFromVector(cvssText);
  //alert(score.baseMetricScore);
  var baseScore = "";
  if (score.success) {
    baseScore += "<center><b>" + "CVSS Score" + "</b></center>";
    baseScore += "Base Score: " + score.baseMetricScore;
    baseScore += "= Impact: " + score.impactMetricScore;
    baseScore += "+ Exploitability: " + score.exploitabilityMetricScore;
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

const installScripts = (tab, message) => {
  console.log("begin installScripts", tab, message);
  // var background = browser.extension.getBackgroundPage();
  // background.message = message;
  // console.log("sending message:", message);
  executeScripts(null, [
    { file: "Scripts/lib/jquery.min.js" },
    // { file: "Scripts/lib/require.js" },
    { file: "Scripts/utils.js" },
    // { code: "var message = " + message  + ";"},
    { file: "Scripts/content.js" },
    { code: "processPage();" },
  ]);
  // browser.tabs.sendMessage(tab.tabId, message);
  console.log("end installScripts");
};
/////////////

if (typeof module !== "undefined") {
  module.exports = {
    artifact: artifact,
    addDataOSSIndex: addDataOSSIndex,
    Artifact: Artifact,
    beginEvaluation: beginEvaluation,
    BuildEmptySettings: BuildEmptySettings,
    BuildSettings: BuildSettings,
    BuildSettingsFromGlobal: BuildSettingsFromGlobal,
    callServer: callServer,
    ChangeIconMessage: ChangeIconMessage,
    checkPageIsHandled: checkPageIsHandled,
    CVSSDetails: CVSSDetails,
    dataSources: dataSources,
    encodeComponentIdentifier: encodeComponentIdentifier,
    epochToJsDate: epochToJsDate,
    evaluateComponent: evaluateComponent,
    evaluatePackage: evaluatePackage,
    formats: formats,
    GetActiveTab: GetActiveTab,
    GetAllVersions: GetAllVersions,
    GetCookie: GetCookie,
    GetCVEDetails: GetCVEDetails,
    GetSettings: GetSettings,
    getDomainName: getDomainName,
    getExtensionVersion: getExtensionVersion,
    getRemediation: getRemediation,
    getUserAgentHeader: getUserAgentHeader,

    jsDateToEpoch: jsDateToEpoch,
    MavenArtifact: MavenArtifact,
    MavenCoordinates: MavenCoordinates,
    NexusFormat: NexusFormat,
    NexusFormatMaven: NexusFormatMaven,
    NexusFormatNPM: NexusFormatNPM,
    NexusFormatNuget: NexusFormatNuget,
    NexusFormatPyPI: NexusFormatPyPI,
    NexusFormatRuby: NexusFormatRuby,
    NPMArtifact: NPMArtifact,
    NugetArtifact: NugetArtifact,
    parseArtifactoryURL: parseArtifactoryURL,
    parseCratesURL: parseCratesURL,
    parseCRANURL: parseCRANURL,
    parseCocoaPodsURL: parseCocoaPodsURL,
    parseGoLangURL: parseGoLangURL,
    parseGitHubURL: parseGitHubURL,
    parseMavenURL: parseMavenURL,
    parseNexusRepoURL: parseNexusRepoURL,
    parseNPM: parseNPM,
    parseNPMURL: parseNPMURL,
    parseNugetURL: parseNugetURL,
    parsePackagistURL: parsePackagistURL,
    ParsePageURL: ParsePageURL,
    parsePyPIURL: parsePyPIURL,
    parseRubyURL: parseRubyURL,
    PyPIArtifact: PyPIArtifact,
    removeCookies: removeCookies,
    SetHash: SetHash,
    setHasVulns: setHasVulns,
    setArtifact: setArtifact,
    styleCVSS: styleCVSS,
  };
}

// export {
//   artifact,
//   beginEvaluation,
//   BuildSettingsFromGlobal,
//   checkPageIsHandled,
//   CVSSDetails,
//   dataSources,
//   evaluateComponent,
//   formats,
//   GetActiveTab,
//   GetAllVersions,
//   GetCVEDetails,
//   getDomainName,
//   getRemediation,
//   getUserAgentHeader,
//   hasVulns,
//   MavenCoordinates,
//   messageTypes,
//   nexusArtifact,
//   NexusFormat,
//   setArtifact,
//   settings,
//   SetHash,
//   setHasVulns,
//   styleCVSS
// };
