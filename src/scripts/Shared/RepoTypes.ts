import { dataSources } from "./DataSources";
import { formats } from "./Formats";
import { nexusRepoformats } from "./NexusRepoFormats";
import { ConanArtifact } from "./ConanArtifact";
import { NPMArtifact } from "./NPMArtifact";
import { MavenArtifact } from "./MavenArtifact";
import { ChocolateyArtifact } from "./ChocolateyArtifact";
import { ClojarsArtifact } from "./ClojarsArtifact";
import { CargoArtifact } from "./CargoArtifact";

const checkPageIsHandled = (url) => {
  console.log("checkPageIsHandled", url);
  if (url === null || typeof url === "undefined") return false;
  //check the url of the tab is in this collection
  // let url = tab.url
  let found = false;
  if (
    url.search("https://pkgs.alpinelinux.org/package/") >= 0 ||
    url.search("https://anaconda.org/anaconda/") >= 0 ||
    url.search("https://chocolatey.org/packages/") >= 0 ||
    url.search("https://clojars.org/") >= 0 ||
    url.search("https://cocoapods.org/pods/") >= 0 ||
    url.search("https://conan.io/center/") >= 0 ||
    url.search("https://cran.r-project.org/") >= 0 ||
    url.search("https://crates.io/") >= 0 ||
    url.search("https://packages.debian.org/") >= 0 ||
    url.search("https://tracker.debian.org/pkg/") >= 0 ||
    (url.search("https://github.com/") >= 0 &&
      url.search("/releases/tag/") >= 0) || //https://github.com/jquery/jquery/releases/tag/3.0.0
    url.search("https://search.gocenter.io/") >= 0 ||
    url.search("https://repo1.maven.org/maven2/") >= 0 ||
    url.search("https://repo.maven.apache.org/maven2/") >= 0 ||
    url.search("https://search.maven.org/artifact/") >= 0 ||
    url.search("https://mvnrepository.com/artifact/") >= 0 ||
    url.search("https://www.npmjs.com/package/") >= 0 ||
    url.search("https://www.nuget.org/packages/") >= 0 ||
    url.search("https://packagist.org/packages/") >= 0 ||
    url.search("https://pypi.org/project/") >= 0 ||
    url.search("https://rpmfind.net/linux/RPM/epel/7/") >= 0 ||
    url.search("https://rubygems.org/gems/") >= 0 ||
    url.search("https://repo.spring.io/list/") >= 0 || //https://repo.spring.io/list/jcenter-cache/org/cloudfoundry/cf-maven-plugin/1.1.3/
    url.search("/webapp/#/artifacts/") >= 0 || //Artifactory //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/us-remote/antlr/antlr/2.7.1/antlr-2.7.1.jar
    url.search("/ui/repos/") >= 0 || //Artifactory //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/us-remote/antlr/antlr/2.7.1/antlr-2.7.1.jar
    //ui/repos
    url.search("/#browse/browse:") >= 0 || //Nexus http://nexus:8081/#browse/browse:maven-central:antlr%2Fantlr%2F2.7.2
    false //dummy entry so I dont have to miss the last ||
  ) {
    found = true;
  }
  return found;
};

function parseNexusRepo(iformat, url) {
  //http://nexus:8081/#browse/browse:maven-central:commons-collections%2Fcommons-collections%2F3.2.1
  console.log("parseNexusRepo:", url);
  let elements = url.split("/");
  //CRAN may have the packagename in the URL
  //but not the version in URL
  //could also be just in the body
  let name;
  let namespace;
  let type;
  let format;
  let datasource;
  let artifact;
  let version;
  let groupId;
  let artifactId;
  //#nx-info-1179 > div > table > tbody > tr:nth-child(2) > td.nx-info-entry-value
  let nexusRepoformat = $(
    "div.nx-info > table > tbody > tr:nth-child(2) > td.nx-info-entry-value"
  ).html();
  console.log("nexusRepoformat", nexusRepoformat);
  switch (nexusRepoformat) {
    case nexusRepoformats.pypi:
      format = formats.pypi;
      datasource = dataSources.NEXUSIQ;

      name = $(
        "div.nx-info > table > tbody > tr:nth-child(3) > td.nx-info-entry-value"
      ).html();
      version = $(
        "div.nx-info > table > tbody > tr:nth-child(4) > td.nx-info-entry-value"
      ).html();
      artifact = {
        format: format,
        datasource: datasource,
        name: name,
        version: version,
        extension: "zip", //whl or zip, how to tell
        qualifier: "",
      };
      break;
    case nexusRepoformats.maven:
      format = formats.maven;
      datasource = dataSources.NEXUSIQ;
      groupId = $(
        "div.nx-info > table > tbody > tr:nth-child(3) > td.nx-info-entry-value"
      ).html();
      artifactId = $(
        "div.nx-info > table > tbody > tr:nth-child(4) > td.nx-info-entry-value"
      ).html();
      version = $(
        "div.nx-info > table > tbody > tr:nth-child(5) > td.nx-info-entry-value"
      ).html();
      artifact = {
        format: format,
        datasource: datasource,
        groupId: groupId,
        artifactId: artifactId,
        version: version,
        extension: "jar",
      };
      break;
    case nexusRepoformats.npm:
      format = formats.npm;
      datasource = dataSources.NEXUSIQ;
      name = $(
        "div.nx-info > table > tbody > tr:nth-child(3) > td.nx-info-entry-value"
      ).html();
      version = $(
        "div.nx-info > table > tbody > tr:nth-child(4) > td.nx-info-entry-value"
      ).html();
      artifact = {
        format: format,
        datasource: datasource,
        packageName: name,
        version: version,
      };
      break;
    case nexusRepoformats.nuget:
      format = formats.nuget;
      datasource = dataSources.NEXUSIQ;
      name = $(
        "div.nx-info > table > tbody > tr:nth-child(3) > td.nx-info-entry-value"
      ).html();
      version = $(
        "div.nx-info > table > tbody > tr:nth-child(4) > td.nx-info-entry-value"
      ).html();
      artifact = {
        format: format,
        datasource: datasource,
        packageId: name,
        version: version,
      };
      break;
    case nexusRepoformats.gem:
      format = formats.gem;
      datasource = dataSources.NEXUSIQ;
      name = $(
        "div.nx-info > table > tbody > tr:nth-child(3) > td.nx-info-entry-value"
      ).html();
      version = $(
        "div.nx-info > table > tbody > tr:nth-child(4) > td.nx-info-entry-value"
      ).html();
      artifact = {
        format: format,
        datasource: datasource,
        name: name,
        version: version,
      };
      break;
    default:
      //Houston I have a problem
      console.log("Unhandled so exit gracefully", nexusRepoformat);
  }
  console.log("component", artifact);
  return artifact;
}

function parseAlpine(format, url) {
  console.log("parseAlpine -  format, url:", format, url);

  let elements = url.split("/");
  console.log(elements.length);
  let version;
  let name = elements[7];
  name = name.replace("#", "");

  version = $("#package > tbody > tr:nth-child(2) > td > strong > a")
    .text()
    .trim();

  console.log("version", version);
  let artifact = {
    format: format,
    datasource: dataSources.NEXUSIQ,
    name: name,
    version: version,
  };
  return artifact;
}

function parseChocolatey(format, url) {
  console.log("parseChocolatey -  format, url:", format, url);
  //#package-sidebar > div.col-md-9.col-xl-10 > div.mb-3.d-none.d-md-block > h1 > span.ml-2
  let elements = url.split("/");
  console.log(elements.length);
  let version;
  let name = elements[4];

  if (elements.length > 5) {
    version = elements[5];
  } else {
    version = $("h1 > span").text().trim();
  }
  console.log("version", version);
  let artifact = {
    format: format,
    datasource: dataSources.OSSINDEX,
    name: name,
    version: version,
  };
  return artifact;
}

function parseConda(format, url) {
  console.log("parseConda -  format, url:", format, url);

  let elements = url.split("/");
  console.log(elements.length);
  let version;
  let name = elements[4];

  version = $("small.subheader").text().trim();
  version = "v" + version;
  console.log("version", version);
  let artifact = {
    format: format,
    datasource: dataSources.NEXUSIQ,
    name: name,
    version: version,
  };
  return artifact;
}

const parseClojars = (format, url) => {
  console.log("parseClojars -  format, url:", format, url);

  let elements = url.split("/");
  console.log(elements.length);
  let version;
  let namespace = elements[4];
  let name = elements[5];
  //[k2n/saml20-clj "0.1.9"] - Clojars
  let title = document.title;
  version = title.split(" ")[1].replace(/"/g, "").replace("]", "").trim();
  console.log("version", version);
  let artifact = {
    format: format,
    datasource: dataSources.OSSINDEX,
    namespace: namespace,
    name: name,
    version: version,
  };
  return artifact;
};

function parseCocoaPods(format, url) {
  console.log("parseCocoaPods. format, url:", format, url);
  let elements = url.split("/");
  //https://cocoapods.org/pods/TestFairy
  let versionHTML = $("H1 span").first().text();
  console.log("versionHTML:", versionHTML);
  let version = versionHTML.trim();
  let name = elements[4];
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  let datasource = dataSources.NEXUSIQ;
  return {
    format: format,
    datasource: datasource,
    name: name,
    version: version,
  };
}

function parseConan(format, url) {
  console.log("parseConan. format, url:", format, url);
  //
  let elements = url.split("/");

  let name = elements[4];
  let version = elements[5];
  let artifact = {
    format: format,
    datasource: dataSources.NEXUSIQ,
    name: name,
    version: version,
  };
  return artifact;
}

function parseCRAN(format, url) {
  //https://ossindex.sonatype.org/api/v3/component-report/cran%3AA3%400.0.1
  //server is CRAN, format is CRAN
  //https://cran.r-project.org/
  // https://cran.r-project.org/web/packages/latte/index.html
  //https://cran.r-project.org/package=clustcurv

  console.log("parseCRAN:", format, url);
  let elements = url.split("/");
  //CRAN may have the packagename in the URL
  //but not the version in URL
  //could also be just in the body
  let name;
  let version;
  if (elements.length > 5) {
    //has packagename in 5
    name = elements[5];
  } else if (elements.length > 3) {
    const pckg = "package=";
    name = elements[3];
    if (name.search(pckg) >= 0) {
      name = name.substr(pckg.length);
    }
  } else {
    name = $("h2").text();
    if (name.search(":") >= 0) {
      name = name.substring(0, name.search(":"));
    }
  }

  let versionHTML = $("table tr:nth-child(1) td:nth-child(2)").first().text();
  console.log("versionHTML:", versionHTML);
  version = versionHTML.trim();
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  let datasource = dataSources.NEXUSIQ;
  return {
    format: format,
    datasource: datasource,
    name: name,
    version: version,
  };
}

function parseCrates(format, url) {
  //server is crates, language is rust
  //https://crates.io/crates/rand

  console.log("parseCrates url:", url);
  let elements = url.split("/");
  //CRAN may have the packagename in the URL
  //but not the version in URL
  //could also be just in the body
  let name = elements[4];
  let version;
  if (elements.length == 5 || elements[6] == "") {
    //has packagename in 5
    //need to parse the HTML
    //
    let found = false;
    let versionHTMLSelector = "div.info h2";
    console.log("Trying: " + versionHTMLSelector);
    let versionHTML = $(versionHTMLSelector);
    let versionNode;
    if (versionHTML.length === 0) {
      console.log("Missed " + versionHTMLSelector);
    } else {
      console.log("found " + versionHTMLSelector);
      console.log("versionHTML", versionHTML);
      versionNode = versionHTML[0];
      found = true;
    }
    if (!found) {
      versionHTMLSelector = "div h2";
      console.log("Trying: " + versionHTMLSelector);
      versionHTML = $(versionHTMLSelector);
      if (versionHTML.length === 0) {
        console.log("Missed div h2");
      } else {
        console.log("versionHTML", versionHTML);
        versionNode = versionHTML[0];
        found = true;
      }
    }

    if (!found) {
      versionHTMLSelector = "h2";
      console.log("Trying: " + versionHTMLSelector);
      versionHTML = $(versionHTMLSelector);
      if (versionHTML.length === 0) {
        console.log("Missed h2");
      } else {
        console.log("versionHTML", versionHTML);
        versionNode = versionHTML[0];
        found = true;
      }
    }

    if (found) {
      version = versionNode.textContent.trim();
    } else {
      return;
    }
  } else if (elements.length == 6) {
    //version is in the Path
    version = elements[5];
  }
  console.log("version", version);
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  let datasource = dataSources.NEXUSIQ;
  let artifact = {
    format: format,
    datasource: datasource,
    name: name,
    version: version,
  };
  return artifact;
}

function parseDebian(format, url) {
  console.log("parseDebian -  format, url:", format, url);

  let elements = url.split("/");
  console.log(elements.length);
  let version;
  let name = elements[4];

  let versionHtml = $("h1");
  //@ts-ignore
  let nameVersion = versionHtml.textContent.trim();
  version = nameVersion.split("(")[1].replace(")", "");
  console.log("version", version);
  let artifact = {
    format: format,
    datasource: dataSources.NEXUSIQ,
    name: name,
    version: version,
  };
  return artifact;
}

function parseDebianTracker(format, url) {
  console.log("parseDebianTracker -  format, url:", format, url);

  let elements = url.split("/");
  console.log(elements.length);
  let version;
  let name = elements[4];

  let versionHtml = $("li.list-group-item")[1];

  let nameVersion = versionHtml.textContent.trim();
  version = nameVersion.split("version:")[1].trim();
  console.log("version", version);
  let artifact = {
    format: format,
    datasource: dataSources.NEXUSIQ,
    name: name,
    version: version,
  };
  return artifact;
}

const parseGoLang = (format, url) =>{
  //server is non-defined, language is go/golang
  //index of github stored at jfrog
  /////////Todo get this working better
  //https://search.gocenter.io/github.com~2Fetcd-io~2Fetcd/versions
  //becomes
  //https://ossindex.sonatype.org/component/pkg:golang/github.com/etcd-io:etcd@v3.3.13

  // pkg:golang/github.com/etcd-io/etcd@3.3.1
  // pkg:github/etcd-io/etcd@3.3.1
  //https://search.gocenter.io/github.com/go-gitea/gitea
  console.log("parseGolang:", format, url);
  let elements = url.split("/");
  //CRAN may have the packagename in the URL
  //but not the version in URL
  //could also be just in the body
  let name;
  let namespace;
  let type;
  if (url.search("search.gocenter.io") >= 0) {
    //has packagename in 5
    let fullname = elements[3];
    //"github.com~2Fhansrodtang~2Frandomcolor"
    //tthe've cleaned it up
    //now looks like https://search.gocenter.io/github.com/go-gitea/gitea
    // let nameElements = fullname.split("");
    // 0: "github.com"
    // 1: "hansrodtang"
    // 2: "randomcolor"
    type = elements[3]; //"github.com";
    namespace = elements[4];
    name = elements[5];
  }

  //CPT 19/09/19 - Gocenter keep changing their markup for golang so we are having trouble
  //parsing.
  let versionHTMLElement;
  if (elements[4] == "versions") {
    //last element in array is versions
    //then we parse for latest version in the document
    //e.g. https://search.gocenter.io/github.com~2Fetcd-io~2Fetcd/versions
    // versionHTMLElement = $(
    //   "#jf-content > ui-view > content-layout > ui-view > go-center-home-page > div > div > div > div > div > div.page-specific-content > ui-view > module-versions-info > div.module-versions-info > div.processed-versions > jf-table-view > div > div.jf-table-view-container.ng-scope > div.table-rows-container.ng-scope > jf-vscroll > div > div > div.h-scroll-wrapper > div > jf-vscroll-element:nth-child(1) > div > div > div > div > div > jf-table-compiled-cell > div > div > span"
    // )[0];
    //<span data-v-43be9f46="" class="red--text mr-2">v1.18.0</span>
    versionHTMLElement = $(".version-name")[0];
    console.log("if versionHTMLElement", versionHTMLElement);
  } else {
    //e.g., https://search.gocenter.io/github.com~2Fgo-gitea~2Fgitea/info?version=v1.5.1
    //<div class="v-select__selection v-select__selection--comma">v1.9.0-dev</div>
    // versionHTMLElement = $(
    //   "#select-header > span > span.ui-select-match-text.pull-left"
    // )[0];
    versionHTMLElement = $("div.v-select__selection")[0];
    console.log("else versionHTMLElement", versionHTMLElement);
  }
  console.log("versionHTMLElement", versionHTMLElement);
  if (typeof versionHTMLElement === "undefined") {
    //raiserror  "DOM changed"
    console.log("DOM changed");
  }
  let versionHTML = versionHTMLElement.innerText;
  console.log("versionHTML", versionHTML);
  let version = versionHTML.trim();
  console.log("version", version);
  //keep the v in version
  // if (version.substr(0, 1) === "v") {
  //   version = version.substr(1);
  // }
  // name = encodeURIComponent(name);
  // version = encodeURIComponent(version);
  let datasource = dataSources.NEXUSIQ;
  let artifact = {
    format: format,
    datasource: datasource,
    type: type,
    namespace: namespace,
    name: name,
    version: version,
  };
  return artifact;
}

function parseMaven(format, url) {
  console.log("parseMaven - format, url:", format, url);
  //old format below
  //for now we have to parse the URL, I cant get the page source??
  //it's in an iframe
  //https://search.maven.org/#artifactdetails%7Ccommons-collections%7Ccommons-collections%7C3.2.1%7Cjar
  //new format here

  //maven repo https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
  let elements = url.split("/");
  let groupId = elements[4];
  //  packageName=url.substr(url.lastIndexOf('/')+1);
  groupId = encodeURIComponent(groupId);
  let artifactId = elements[5];
  artifactId = encodeURIComponent(artifactId);

  let version = elements[6];
  version = encodeURIComponent(version);

  let extension = elements[7];
  if (typeof extension === "undefined") {
    //mvnrepository doesnt have it
    extension = "jar";
  }
  extension = encodeURIComponent(extension);
  let datasource = dataSources.NEXUSIQ;
  return {
    format: format,
    groupId: groupId,
    artifactId: artifactId,
    version: version,
    extension: extension,
    datasource: datasource,
  };
}

function parseNPM(format, url) {
  console.debug("parseNPM", format, url);
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

///////

///////

function parseNuget(format, url) {
  console.log("parseNuget:", format, url);
  //we can parse the URL or the DOM
  //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
  let elements = url.split("/");
  console.log("elements", elements);
  let packageId;
  let version;
  let datasource;
  if (elements.length <= 5 || (elements.length === 6 && elements[5] === "")) {
    //we are on the latest version - no version in the url
    //https://www.nuget.org/packages/LibGit2Sharp/
    // packageId = elements[4];
    //version = $(".package-title .text-nowrap").text();

    //case sensitive problem
    //HDS is case sensitive, URLs are not
    //ouch
    //going to parse the document.title
    //document.title.split(' ')
    //title: "NuGet Gallery | Polly 7.1.0"
    let titleElements = document.title
      .trim()
      .split(" ")

      .filter((el) => el != "");
    packageId = titleElements[3];
    //#skippedToContent > section > div > article > div.package-title > h1 > small
    version = titleElements[4];
  } else {
    packageId = elements[4];
    //  packageName=url.substr(url.lastIndexOf('/')+1);
    version = elements[5];
  }
  packageId = encodeURIComponent(packageId);
  version = encodeURIComponent(version);
  datasource = dataSources.NEXUSIQ;
  let nugetArtifact = {
    format: format,
    packageId: packageId,
    version: version,
    datasource: datasource,
  };
  console.log("nugetArtifact", nugetArtifact);
  return nugetArtifact;
}

///NEXUSIQ////
function parsePackagist(format, url) {
  //server is packagist, format is composer
  console.log("parsePackagist:", url);
  let name;
  let version;
  var elements = url.split("/");
  //https://packagist.org/packages/drupal/drupal
  //Specific version is with a hash
  //https://packagist.org/packages/drupal/drupal#8.6.2
  // https://packagist.org/packages/phpbb/phpbb#3.1.2
  var namePt1 = elements[4];
  var namePt2 = elements[5];
  name = namePt1 + "/" + namePt2;
  var whereIs = namePt2.search("#");
  var namespace = namePt1;
  var nameOnly;
  //is the version number in the URL? if so get that, else get it from the HTML
  if (whereIs > -1) {
    version = namePt2.substr(whereIs + 1);
    nameOnly = namePt2.substr(0, whereIs);
  } else {
    //get the version from the HTML as we are on the generic page
    //#headline > div > h1 > span
    let versionHTML = $("span.version-number").first().text();
    console.log("versionHTML:", versionHTML);
    version = versionHTML.trim();
    nameOnly = namePt2;
  }
  // name = encodeURIComponent(name);
  // version = encodeURIComponent(version);
  let datasource = dataSources.NEXUSIQ;
  return {
    format: format,
    datasource: datasource,
    name: nameOnly,
    namespace: namespace,
    version: version,
  };
}

function parsePyPI(format, url) {
  console.log("parsePyPI", format, url);
  let version, name, datasource, extension, qualifier;
  //https://pypi.org/project/Django/1.6/
  //https://pypi.org/project/Django/
  let elements = url.split("/");
  console.log("elements", elements);
  if (elements[5] == "" || elements[5].includes("#")) {
    //empty in element 5 means no version in the url
    //then we will try to parse
    //#content > section.banner > div > div.package-header__left > h1
    //Says Django 2.0.5
    name = elements[4];
    let versionHTML = $("h1.package-header__name").text().trim();
    console.log("versionHTML", versionHTML);
    let versionElements = versionHTML.split(" ");
    version = versionElements[1];
    console.log("version", version);
    //will try and get qualifier and extension
    //#files > table > tbody > tr:nth-child(1) > td:nth-child(1) > a:nth-child(1)
  } else {
    name = elements[4];
    //  packageName=url.substr(url.lastIndexOf('/')+1);
    version = elements[5];
  }
  //qualifier is

  let qualifierHTML: string = document.querySelectorAll(
    "#files > table > tbody > tr > th > a"
    //@ts-ignore
  )[0].href;
  qualifierHTML = qualifierHTML.split("/")[qualifierHTML.split("/").length - 1];
  console.log("qualifierHTML", qualifierHTML);
  //"numpy-1.16.4-cp27-cp27m-macosx_10_6_intel.macosx_10_9_intel.macosx_10_9_x86_64.macosx_10_10_intel.macosx_10_10_x86_64.whl"
  //qualifier is ->cp27-cp27m-macosx_10_6_intel.macosx_10_9_intel.macosx_10_9_x86_64.macosx_10_10_intel.macosx_10_10_x86_64
  let name_ver = `${name}-${version}-`;
  qualifier = qualifierHTML.substr(
    name_ver.length,
    qualifierHTML.lastIndexOf(".") - name_ver.length
  );
  // extension = qualifierHTML.substr(qualifierHTML.lastIndexOf(".") + 1);
  //$("#files > table > tbody:contains('.zip')").text()
  console.log("qualifier", qualifier);
  extension = qualifierHTML.substring(qualifierHTML.lastIndexOf(".") + 1);
  console.log("extension", extension);
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  datasource = dataSources.NEXUSIQ;
  let artifact = {
    format: format,
    name: name,
    version: version,
    datasource: datasource,
    extension: extension,
    qualifier: qualifier,
  };
  return artifact;
}

function parseRuby(format, url) {
  //for now we have to parse the URL, I cant get the page source??
  //it's in an iframe
  console.log("parseRuby");
  let elements = url.split("/");
  let name;
  let versionHTML;
  let version;
  let datasource;
  if (elements.length < 6 || elements[5] == "") {
    //current version is inside the dom
    //https://rubygems.org/gems/bundler
    //https://rubygems.org/gems/omniauth/
    name = elements[4];
    versionHTML = $("i.page__subheading").text();
    console.log("versionHTML:", versionHTML);
    version = versionHTML.trim();
  } else {
    //https://rubygems.org/gems/bundler/versions/1.16.1
    name = elements[4];
    //  packageName=url.substr(url.lastIndexOf('/')+1);
    version = elements[6];
  }
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  datasource = dataSources.NEXUSIQ;
  return {
    format: format,
    name: name,
    version: version,
    datasource: datasource,
  };
}

var repoTypes = [
  {
    url: "https://pkgs.alpinelinux.org/package/",
    repoFormat: formats.alpine,
    parseFunction: parseAlpine,
    titleSelector: "th.header ~ td",
    versionPath: "",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "",
  },
  {
    url: "https://anaconda.org/anaconda/",
    repoFormat: formats.conda,
    parseFunction: parseConda,
    titleSelector: "span.long-breadcrumb",
    versionPath: "",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "",
  },
  {
    url: "https://chocolatey.org/packages/",
    repoFormat: formats.chocolatey,
    parseFunction: parseChocolatey,
    titleSelector: "h1",
    versionPath: "{url}/{packagename}/{versionNumber}",
    dataSource: dataSources.OSSINDEX,
  },
  {
    url: "https://clojars.org/",
    repoFormat: formats.clojars,
    parseFunction: parseClojars,
    titleSelector: "#jar-title > h1 > a",
    versionPath: "",
    dataSource: dataSources.OSSINDEX,
    appendVersionPath: "/versions/{version}",
  },
  {
    url: "https://cocoapods.org/pods/",
    repoFormat: formats.cocoapods,
    parseFunction: parseCocoaPods,
    titleSelector: "h1",
    versionPath: "",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "",
  },
  {
    url: "https://conan.io/center/",
    repoFormat: formats.conan,
    parseFunction: parseConan,
    titleSelector: ".package-name",
    versionPath: "",
    appendVersionPath: "",
    dataSource: dataSources.NEXUSIQ,
  },
  {
    url: "https://cran.r-project.org/",
    repoFormat: formats.cran,
    parseFunction: parseCRAN,
    titleSelector: "h2", //"h2.title",?
    versionPath: "",
    appendVersionPath: "",
    dataSource: dataSources.NEXUSIQ,
  },
  {
    url: "https://crates.io/crates/",
    repoFormat: formats.cargo,
    parseFunction: parseCrates,
    titleSelector: "div[class*='heading'] h1",
    versionPath: "{url}/{packagename}/{versionNumber}", // https://crates.io/crates/claxon/0.4.0
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "/{versionNumber}",
  },
  {
    url: "https://packages.debian.org",
    repoFormat: formats.debian,
    parseFunction: parseDebian,
    titleSelector: "",
    versionPath: "",
    dataSource: dataSources.NEXUSIQ,
  },
  {
    url: "https://tracker.debian.org/pkg",
    repoFormat: formats.debian,
    parseFunction: parseDebianTracker,
    titleSelector: "li.list-group-item",
    versionPath: "",
    dataSource: dataSources.NEXUSIQ,
  },
  {
    url: "https://search.gocenter.io/",
    repoFormat: formats.golang,
    parseFunction: parseGoLang,
    titleSelector: "#app div.v-application--wrap h1",
    versionPath: "{url}/{packagename}/info?version={versionNumber}", // https://search.gocenter.io/github.com~2Fgo-gitea~2Fgitea/info?version=v1.5.1
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "/info?version={versionNumber}",
  },
  {
    url: "https://repo1.maven.org/maven2/",
    repoFormat: formats.maven,
    parseFunction: parseMaven,
    titleSelector: "h1",
    versionPath: "{url}/{groupid}/{artifactid}/{versionNumber}",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "",
  },
  {
    url: "https://repo.maven.apache.org/maven2/",
    repoFormat: formats.maven,
    parseFunction: parseMaven,
    titleSelector: "h1",
    versionPath: "{url}/{groupid}/{artifactid}/{versionNumber}",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "",
  },
  {
    url: "https://search.maven.org/artifact/",
    repoFormat: formats.maven,
    parseFunction: parseMaven,
    titleSelector: ".artifact-title",
    versionPath: "{url}/{groupid}/{artifactid}/{versionNumber}/{extension}",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "",
  },
  {
    url: "https://mvnrepository.com/artifact/",
    repoFormat: formats.maven,
    parseFunction: parseMaven,
    titleSelector: "h2.im-title",
    versionPath: "{url}/{groupid}/{artifactid}/{versionNumber}",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "",
  },
  {
    url: "https://www.npmjs.com/package/",
    repoFormat: formats.npm,
    parseFunction: parseNPM,
    titleSelector: "#top > div > h2 > span", //".package-name-redundant",
    // titleSelector: ".package-name-redundant",
    versionPath: "{url}/{packagename}/v/{versionNumber}",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "/v/{versionNumber}",
  },
  {
    //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
    url: "https://www.nuget.org/packages/",
    repoFormat: formats.nuget,
    parseFunction: parseNuget,
    titleSelector: ".package-title > h1",
    versionPath: "{url}/{packagename}/{versionNumber}",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "/{versionNumber}",
  },

  {
    url: "https://packagist.org/packages/",
    repoFormat: formats.composer,
    parseFunction: parsePackagist,
    titleSelector: "h2.title",
    versionPath: "{url}/{packagename}#{versionNumber}",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "#{versionNumber}",
  },
  {
    url: "https://pypi.org/project/",
    repoFormat: formats.pypi,
    parseFunction: parsePyPI,
    titleSelector: "h1.package-header__name",
    versionPath: "{url}/{packagename}/{versionNumber}",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "{versionNumber}",
  },
  {
    url: "https://rubygems.org/gems/",
    repoFormat: formats.gem,
    parseFunction: parseRuby,
    titleSelector: "h1.t-display",
    versionPath: "{url}/{packagename}/versions/{versionNumber}",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "/versions/{versionNumber}",
  },
  {
    url: "/#browse/browse:",
    parseFunction: parseNexusRepo,
    titleSelector: "div[id*='-coreui-component-componentinfo-'",
    versionPath: "",
    dataSource: dataSources.NEXUSIQ,
    appendVersionPath: "",
  },
];

function findRepoType(url?) {
  //TODO: fix url parameter handling
  url = location.href;
  for (let i = 0; i < repoTypes.length; i++) {
    console.log("url", repoTypes[i].url, url);
    if (url.search(repoTypes[i].url) >= 0) {
      return repoTypes[i];
    }
  }
  return undefined;
}

const parseCocoaPodsURL = (url) => {
  console.log("parseCocoaPodsURL");
  let format = formats.cocoapods;
  let datasource = dataSources.NEXUSIQ;

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
  let format = formats.cran;
  let datasource = dataSources.NEXUSIQ;

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
  let artifact: any = "";
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

const parseCratesURL = (url) => {
  //server is crates, language is rust
  //https://crates.io/crates/rand

  // https://crates.io/crates/core-nightly/0.0.0-20141227
  let format = formats.cargo;
  let datasource = dataSources.NEXUSIQ;
  let version, name;
  let theUrl = new URL(url);
  let urlElements = theUrl.href.split("/");
  if (urlElements.length > 5 && urlElements[5] !== "") {
    version = urlElements[5];
    name = urlElements[4];
    let artifact = new CargoArtifact(name, version);
    return artifact;
  } else {
    return;
  }
};

const parseURLConda = (url) => {
  return false;
};

const parseURLAlpine = (url) => {
  return false;
};

const parseURLDebian = (url) => {
  return false;
};

const parseURLClojars = (url) => {
  //https://clojars.org/k2n/saml20-clj/versions/0.1.7
  let format = formats.clojars;
  let urlObject = new URL(url);
  let pathElements = urlObject.pathname.split("/");
  if (pathElements.length >= 5) {
    let nameSpace = pathElements[1];
    let packageName = pathElements[2];
    let version = pathElements[4];
    let datasource = dataSources.OSSINDEX;
    let artifact = new ClojarsArtifact(nameSpace, packageName, version);
    return artifact;
  }
  return;
};

const parseURLChocolatey = (url) => {
  //https://chocolatey.org/packages/python3/3.9.0-a5
  let format = formats.chocolatey;
  let urlObject = new URL(url);
  let pathElements = urlObject.pathname.split("/");
  let packageName = pathElements[2];
  let version = pathElements[3];
  let datasource = dataSources.OSSINDEX;
  let artifact = new ChocolateyArtifact(packageName, version);
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
    groupId,
    artifactId,
    version,
    extension,
    classifier
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
  let artifact: any = "";
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
    let rartifact = new NPMArtifact(packageName, version);
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
  console.log("parsePackagistURL:" + url);
  const elements = url.split("/");
  let format = formats.composer;
  let datasource = dataSources.NEXUSIQ;

  let artifact;

  let version;
  //https://packagist.org/packages/drupal/drupal
  //Specific version is with a hash
  //https://packagist.org/packages/drupal/drupal#8.6.2
  //https://packagist.org/packages/phpbb/phpbb#3.1.2
  let namespace = elements[4];
  let namePt2 = elements[5];
  let name, fullName;

  let whereIs = namePt2.search("#");
  //is the version number in the URL? if so get that, else get it from the HTML
  //can only parse the DOM from content script
  //so this script will return falsy
  if (whereIs > -1) {
    version = namePt2.substr(whereIs + 1);
    name = namePt2.substr(0, whereIs);
    fullName = namespace + "/" + namePt2;
    name = encodeURIComponent(name);
    version = encodeURIComponent(version);
    artifact = {
      format: format,
      datasource: datasource,
      name: name,
      namespace: namespace,
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

const parseURLArtifactory = (url) => {
  console.log("parseURLArtifactory", url);
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
  //http://3.16.36.254:8082/ui/repos/tree/General/maven-central-jfrog-cache%2Fcommons-collections%2Fcommons-collections%2F3.2.1%2Fcommons-collections-3.2.1.jar
  let elements = url.split("/");
  let lastElement = elements[elements.length - 1];
  console.log("elements", elements);
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
    if (element === "ui") {
      //  http://3.16.36.254:8082/ui/repos/tree/General/maven-central-jfrog-cache%2Fcommons-collections%2Fcommons-collections%2F3.2.1%2Fcommons-collections-3.2.1.jar
      baseIndex = index + 1;
      repoIndex = baseIndex + 2;
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
    if (lastElement.search(/[.][a-z]ar/) > -1) {
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
    } else if (lastElement.search("%2F") >= 0) {
      console.log("search(%2F");
      //http://3.16.36.254:8082/ui/repos/tree/General/maven-central-jfrog-cache%2Fcommons-collections%2Fcommons-collections%2F3.2.1%2Fcommons-collections-3.2.1.jar
      //http://3.16.36.254:8082/ui/repos/tree/General/maven-central-jfrog-cache%2Fcom%2Ffasterxml%2Fjackson%2Fcore%2Fjackson-databind%2F2.8.9%2Fjackson-databind-2.8.9.jar
      let componentElements = lastElement.split("%2F");
      //need to go in reverse order, skipping the last elements
      let counter = 0;
      let fileName = componentElements.pop();
      let extensionElements = fileName.split(".");
      extension = extensionElements[extensionElements.length - 1];
      version = componentElements.pop();
      artifactId = componentElements.pop();
      groupId = "";
      //skip first element which is the repo name
      let groupElsCount = componentElements.length - 1;
      for (let index = 0; index < groupElsCount; index++) {
        groupId = componentElements.pop() + "." + groupId;
      }
      //remove final .
      groupId = groupId.substring(0, groupId.length - 1);
      // groupIdIndex = 1;
      // groupId = componentElements[groupIdIndex];
      // artifactIdIndex = groupIdIndex + 1;
      // artifactId = componentElements[artifactIdIndex];
      // versionIndex = artifactIdIndex + 1;
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

const parseURLConan = (url) => {
  // https://conan.io/center/apache-apr/1.6.3/
  let format = formats.conan;
  let datasource = dataSources.NEXUSIQ;
  let hash;
  let packageName;
  let version;

  var urlElements = url.split("/");
  packageName = urlElements[4];
  version = urlElements[5];
  let artifact = new ConanArtifact(packageName, version);
  return artifact;
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
  } else if (url.search("https://pkgs.alpinelinux.org/package/") >= 0) {
    //https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
    format = formats.alpine;
    artifact = parseURLAlpine(url);
  } else if (url.search("https://anaconda.org/anaconda/") >= 0) {
    //https://anaconda.org/anaconda/
    format = formats.conda;
    artifact = parseURLConda(url);
  } else if (url.search("https://chocolatey.org/packages/") >= 0) {
    //https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
    format = formats.chocolatey;
    artifact = parseURLChocolatey(url);
  } else if (url.search("https://packages.debian.org/") >= 0) {
    //https://packages.debian.org/jessie/libpng++-dev
    format = formats.debian;
    artifact = parseURLDebian(url);
  } else if (url.search("https://clojars.org/") >= 0) {
    //https://packages.debian.org/jessie/libpng++-dev
    format = formats.clojars;
    artifact = parseURLClojars(url);
  } else if (url.search("https://tracker.debian.org/pkg/") >= 0) {
    //https://tracker.debian.org/pkg/libpng
    format = formats.debian;
    artifact = parseURLDebian(url);
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
  //http://3.16.36.254:8082/ui/repos/tree/General/maven-central-jfrog-cache%2Fcommons-collections%2Fcommons-collections%2F3.2.1%2Fcommons-collections-3.2.1.jar
  else if (
    url.search("webapp/#/artifacts") >= 0 ||
    url.search("/list/") >= 0 ||
    url.search("/ui/repos") >= 0
  ) {
    artifact = parseURLArtifactory(url);
  }
  //nexus Repo
  // http://nexus:8081/#browse/browse:maven-central:antlr%2Fantlr%2F2.7.2
  else if (url.search("#browse/browse:") >= 0) {
    artifact = parseNexusRepoURL(url);
  } else if (url.search("https://rpmfind.net/linux/RPM/epel/") >= 0) {
    artifact = parseRPMRepoURL(url);
  } else if (url.search("https://conan.io/center/") >= 0) {
    artifact = parseURLConan(url);
  }
  console.log("ParsePageURL Complete. artifact:", artifact);
  //now we write this to background as
  //we pass variables through background
  return artifact;
};



export {
  checkPageIsHandled,
  repoTypes,
  findRepoType,
  parseAlpine,
  parseCRAN,
  parseChocolatey,
  parseClojars,
  parseCocoaPods,
  parseConan,
  parseConda,
  parseCrates,
  parsePackagist,
  parseDebian,
  parseDebianTracker,
  parseGoLang,
  parseMaven,
  parseNexusRepo,
  parseNPM,
  parseNuget,
  parsePyPI,
  parseRuby,
  //URL Parsers
  parseURLArtifactory,
  parseURLChocolatey,
  parseURLClojars,
  parseCRANURL,
  parseCratesURL,
  parseCocoaPodsURL,
  parseURLConan,
  parseGoLangURL,
  parseGitHubURL,
  parseMavenURL,
  parseNexusRepoURL,
  parseNPMURL,
  parseNugetURL,
  parsePackagistURL,
  ParsePageURL,
  parsePyPIURL,
  parseRubyURL,
};
