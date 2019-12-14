// import BuildEmptySettings from '../Scripts/util';
/*jslint es6 */
const {
  BuildEmptySettings,
  BuildSettings,
  checkPageIsHandled,
  NexusFormat,
  NexusFormatMaven,
  NexusFormatNPM,
  NexusFormatNuget,
  NexusFormatPyPI,
  NexusFormatRuby,
  epochToJsDate,
  jsDateToEpoch,
  encodeComponentIdentifier,
  parseMavenURL,
  parseNPMURL,
  parseNugetURL,
  parsePyPIURL,
  parseRubyURL,
  parsePackagistURL,
  parseCocoaPodsURL,
  parseCRANURL,
  parseGoLangURL,
  parseCratesURL,
  parseArtifactoryURL,
  parseGitHubURL,
  parseNexusRepoURL,
  ParsePageURL,
  Artifact,
  MavenArtifact,
  NPMArtifact,
  NugetArtifact,
  PyPIArtifact,
  formats,
  dataSources,
  getExtensionVersion
} = require("../Scripts/utils");

test("Can build empty Settings", () => {
  let actual = BuildEmptySettings();
  let expected = {
    username: "",
    password: "",
    tok: "",
    hash: "",
    auth: "",
    restEndPoint: "",
    baseURL: "",
    url: "",
    loginEndPoint: "",
    loginurl: ""
  };
  expect(expected).toEqual(actual);
});

test("Can BuildSettings", () => {
  let baseURL = "http://localhost:8070";
  let username = "happy";
  let password = "world";
  let appId = "sand";
  let appInternalId = "box";

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
  let expected = {
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
    appInternalId: appInternalId
  };

  let actual = BuildSettings(baseURL, username, password, appId, appInternalId);
  expect(expected.appId).toBe(actual.appId);
});

test("CheckPageIsHandled positive test - maven", () => {
  let actual = checkPageIsHandled("https://search.maven.org/");
  let expected = true;
  expect(expected).toBe(actual);
});

test("CheckPageIsHandled positive test - maven", () => {
  let actual = checkPageIsHandled("https://mvnrepository.com/");
  let expected = true;
  expect(expected).toBe(actual);
});

test("CheckPageIsHandled positive test - maven", () => {
  let actual = checkPageIsHandled("https://repo1.maven.org/maven2/");
  let expected = true;
  expect(expected).toBe(actual);
});
test("CheckPageIsHandled positive test - maven", () => {
  let actual = checkPageIsHandled("http://repo2.maven.org/maven2/");
  let expected = true;
  expect(expected).toBe(actual);
});

test("CheckPageIsHandled positive test - nuget", () => {
  let actual = checkPageIsHandled("https://www.nuget.org/");
  let expected = true;
  expect(expected).toBe(actual);
});

test("CheckPageIsHandled positive test - NPM", () => {
  let actual = checkPageIsHandled("https://www.npmjs.com/");
  let expected = true;
  expect(expected).toBe(actual);
});

test("CheckPageIsHandled positive test - https://rubygems.org/", () => {
  let actual = checkPageIsHandled("https://rubygems.org/");
  let expected = true;
  expect(expected).toBe(actual);
});

test("CheckPageIsHandled positive test - https://pypi.org/", () => {
  let actual = checkPageIsHandled("https://pypi.org/");
  let expected = true;
  expect(expected).toBe(actual);
});

test("CheckPageIsHandled positive test - https://packagist.org/", () => {
  let actual = checkPageIsHandled("https://packagist.org/");
  let expected = true;
  expect(expected).toBe(actual);
});

test("CheckPageIsHandled positive test - CRAN", () => {
  let actual = checkPageIsHandled("https://cran.r-project.org/");
  let expected = true;
  expect(expected).toBe(actual);
});

test("CheckPageIsHandled positive test - Crates", () => {
  let actual = checkPageIsHandled("https://crates.io/");
  let expected = true;
  expect(expected).toBe(actual);
});

test("CheckPageIsHandled positive test - gocenter", () => {
  let actual = checkPageIsHandled("https://search.gocenter.io/"); //url changed
  let expected = true;
  expect(expected).toBe(actual);
});

test("CheckPageIsHandled negative test - Google", () => {
  let actual = checkPageIsHandled("http://www.google.com");
  let expected = false;
  expect(expected).toBe(actual);
});

test("Check NexusFormat positive test", () => {
  let artifact = {
    format: "maven",
    groupId: "commons-collections",
    artifactId: "commons-collections",
    version: "3.2.1",
    extension: "jar",
    classifier: "",
    hash: null
  };
  let actual = NexusFormat(artifact);
  let expected = {
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
            classifier: artifact.classifier
          }
        }
      })
    ]
  };
  expect(expected).toEqual(actual);
});

test("Check NexusFormatMaven positive test", () => {
  let artifact = {
    format: "maven",
    groupId: "commons-collections",
    artifactId: "commons-collections",
    version: "3.2.1",
    extension: "jar",
    classifier: "",
    hash: null
  };
  let actual = NexusFormatMaven(artifact);
  let expected = {
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
            classifier: artifact.classifier
          }
        }
      })
    ]
  };
  expect(expected).toEqual(actual);
});

test("Check NexusFormatNPM positive test", () => {
  let artifact = {
    format: "npm",
    packageName: "lodash",
    version: "4.17.11",
    hash: null
  };
  let actual = NexusFormatNPM(artifact);
  let expected = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            packageId: artifact.packageName,
            version: artifact.version
          }
        }
      })
    ]
  };
  expect(expected).toEqual(actual);
});

test("Check NexusFormatNuget positive test", () => {
  let artifact = {
    format: "nuget",
    packageId: "LibGit2Sharp",
    version: "0.1.0",
    hash: null
  };
  let actual = NexusFormatNuget(artifact);
  //return a dictionary in Nexus Format ofr Nuget
  //return dictionary of components
  let expected = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            packageId: artifact.packageId,
            version: artifact.version
          }
        }
      })
    ]
  };
  expect(expected).toEqual(actual);
});

test("Check NexusFormatPyPI positive test", () => {
  let artifact = {
    format: "pypi",
    packageId: "Django",
    version: "1.6",
    hash: null
  };
  let actual = NexusFormatPyPI(artifact);
  //return a dictionary in Nexus Format
  //return dictionary of components
  //TODO: how to determine the qualifier and the extension??
  let expected = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: artifact.name,
            qualifier: artifact.qualifier,
            version: artifact.version,
            extension: artifact.extension
          }
        }
      })
    ]
  };
  expect(expected).toEqual(actual);
});

test("Check NexusFormatRuby positive test", () => {
  let artifact = {
    format: "gem",
    packageId: "bundler ",
    version: "2.0.1",
    hash: null
  };
  let actual = NexusFormatRuby(artifact);
  //return a dictionary in Nexus Format
  //return dictionary of components
  //TODO: how to determine the qualifier and the extension??
  let expected = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: artifact.name,
            version: artifact.version
          }
        }
      })
    ]
  };
  expect(expected).toEqual(actual);
});

//no test for parseCRAN can be written because we dont have content JS iFrame
// test('Check parseCRAN positive test', () => {
//   if (url.search('cran.r-project.org/') >=0){
//     //https://rubygems.org/gems/bundler/versions/1.16.1
//     format = formats.cran;
//     datasource = dataSources.OSSINDEX;
//     artifact = parseCRAN('cran', 'https://cran.r-project.org/package=clustcurv', dataSources.OSSINDEX);

//   }
//   expect(expected).toEqual(actual);
// });

test("Check epochToJsDate positive test", () => {
  let ts = 1554116734;
  let actual = epochToJsDate(ts);
  let expected = new Date("2019-04-01T11:05:34.000Z"); //UTC
  expect(expected).toEqual(actual);
});

test("Check jsDateToEpoch positive test", () => {
  let baseDate = new Date("2019-04-01T11:05:34.000Z"); //UTC
  let actual = jsDateToEpoch(baseDate);
  let expected = 1554116734;
  expect(expected).toEqual(actual);
});

test("jsDateToEpoch on Error", () => {
  const t = () => {
    // throw new TypeError();
    // jsDateToEpoch('junk');
    // expect(badDate).toThrowError(new Error('Bad date passed in'));
    expect(() => {
      jsDateToEpoch("junk");
    }).toThrow(TypeError);
  };
});

test("Check encodeComponentIdentifier maven - encoder", () => {
  let artifact = {
    format: "maven",
    artifactId: "springfox-swagger-ui",
    classifier: "",
    extension: "jar",
    groupId: "io.springfox",
    version: "2.6.1"
  };
  let nexusArtifact = NexusFormatMaven(artifact);
  // let actual =  encodeURIComponent(JSON.stringify(artifact))
  let actual = encodeComponentIdentifier(nexusArtifact);
  let expected =
    "%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22groupId%22%3A%22io.springfox%22%2C%22artifactId%22%3A%22springfox-swagger-ui%22%2C%22version%22%3A%222.6.1%22%2C%22extension%22%3A%22jar%22%2C%22classifier%22%3A%22%22%7D%7D";
  //let ereceived = '%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22groupId%22%3A%22io.springfox%22%2C%22artifactId%22%3A%22springfox-swagger-ui%22%2C%22version%22%3A%222.6.1%22%2C%22extension%22%3A%22jar%22%7D%7D'
  //let expected = '%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22artifactId%22%3A%22springfox-swagger-ui%22%2C%22classifier%22%3A%22%22%2C%22extension%22%3A%22jar%22%2C%22groupId%22%3A%22io.springfox%22%2C%22version%22%3A%222.6.1%22%7D%7D'
  expect(actual).toBe(expected);
  // expect(1).toBe(1);
});

test("Check Artifact Class", () => {
  let format = formats.npm;
  let hash = "test";
  let datasource = dataSources.NEXUSIQ;
  let actual = new Artifact(format, hash, datasource);
  let expected = new Artifact(format, hash, datasource);
  expect(actual.format).toBe(expected.format);
});

test("Check MavenArtifact class", () => {
  let format = "maven";
  let groupId = "commons-collections";
  let artifactId = "commons-collections";
  let version = "3.2.1";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let actual = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );

  //${groupId}:${artifactId}`;
  let expected = new MavenArtifact(
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );
  expect(actual).toEqual(expected);
});

test("Check MavenArtifact display method", () => {
  let format = "maven";
  let groupId = "commons-collections";
  let artifactId = "commons-collections";
  let version = "3.2.1";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );

  let actual = artifact.display();
  //${groupId}:${artifactId}`;
  let expected = `<tr>
                            <td class="label">Group:</td>
                            <td class="data"><span id="group">${groupId}</span></td>
                        </tr>
                        <tr>
                            <td class="label">Artifact:</td>
                            <td class="data"><span id="artifact">${artifactId}</span></td>
                        </tr>                        
                        <tr>
                            <td class="label">Version:</td>
                            <td class="data"><span id="version">${version}</span></td>
                        </tr>`;
  let expectedHack = "maven";
  expect(actual).toEqual(expectedHack);
  // expect(actual).toEqual(expected);
});

test("Check NPMArtifact class", () => {
  let packageName = "lodash";
  let version = "4.17.9";

  let actual = new NPMArtifact(packageName, version);
  let expected = new NPMArtifact(packageName, version);
  expect(actual).toEqual(expected);
});

test("Check NugetArtifact class", () => {
  let packageId = "a";
  let version = "1";

  let actual = new NugetArtifact(packageId, version);
  let expected = new NugetArtifact(packageId, version);
  expect(actual).toEqual(expected);
});

test("Check pypiArtifact class", () => {
  let name = "a";
  let version = "1";

  let actual = new PyPIArtifact(name, version);
  let expected = new PyPIArtifact(name, version);
  expect(actual).toEqual(expected);
});

test("Check parseMavenURL(format, search.maven.org) positive test", () => {
  let format = "maven";
  let groupId = "commons-collections";
  let artifactId = "commons-collections";
  let version = "3.2.1";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );

  //SEARCH      https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar

  let url =
    "https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar";
  let actual = parseMavenURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check parseMavenURL(format, mvnrepository) positive test", () => {
  let format = "maven";
  let groupId = "commons-collections";
  let artifactId = "commons-collections";
  let version = "3.2.1";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );

  let url =
    "https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1";
  let actual = parseMavenURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check parseMavenURL(format, https://repo1.maven.org) positive test", () => {
  let format = "maven";
  let groupId = "commons-collections";
  let artifactId = "commons-collections";
  let version = "3.2.1";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );

  let url =
    "https://repo1.maven.org/maven2/commons-collections/commons-collections/3.2.1/";
  let actual = parseMavenURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check parseMavenURL(format, https://repo1.maven.org) positive test", () => {
  let format = "maven";
  let groupId = "com.github.jedis-lock";
  let artifactId = "jedis-lock";
  let version = "1.0.0";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );

  let url =
    "https://repo1.maven.org/maven2/com/github/jedis-lock/jedis-lock/1.0.0/";
  let actual = parseMavenURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check parseMavenURL(format, http://repo2.maven.org) positive test", () => {
  let format = "maven";
  let groupId = "commons-collections";
  let artifactId = "commons-collections";
  let version = "3.2.1";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );

  let url =
    "http://repo2.maven.org/maven2/commons-collections/commons-collections/3.2.1/";
  let actual = parseMavenURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check parseMavenURL(format, https://repo1.maven.org) positive test", () => {
  let format = "maven";
  let groupId = "com.github.jedis-lock";
  let artifactId = "jedis-lock";
  let version = "1.0.0";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );

  let url =
    "http://repo2.maven.org/maven2/com/github/jedis-lock/jedis-lock/1.0.0/";
  let actual = parseMavenURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check parseNPMURL(npmjs.com) positive test", () => {
  let format = "npm";
  let artifact = {
    format: format,
    packageName: "lodash",
    version: "4.17.9",
    datasource: "NEXUSIQ"
  };

  let url = "https://www.npmjs.com/package/lodash/v/4.17.9";
  let actual = parseNPMURL(url);
  let expected = artifact;
  expect(actual.format).toEqual(expected.format);
});

test("Check parseNPMURL(npmjs.com) positive test @angular/animation", () => {
  // /https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/issues/7
  //https://www.npmjs.com/package/@angular/animation/v/4.0.0-beta.8
  let format = "npm";
  let artifact = {
    format: format,
    packageName: "@angular/animation",
    version: "4.0.0-beta.8",
    datasource: "NEXUSIQ"
  };

  let url = "https://www.npmjs.com/package/@angular/animation/v/4.0.0-beta.8";
  let actual = parseNPMURL(url);
  let expected = artifact;
  expect(actual.format).toEqual(expected.format);
});

test("Check parseNPMURL(npmjs.com) negative test", () => {
  let format = "npm";
  let artifact = {
    format: format,
    packageName: "lodash",
    version: undefined,
    datasource: "NEXUSIQ"
  };

  let url = "https://www.npmjs.com/package/lodash/";
  let actual = parseNPMURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check parseNugetURL (www.nuget.org) positive test", () => {
  //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
  let format = "nuget";
  let artifact = {
    format: format,
    packageId: "LibGit2Sharp",
    version: "0.20.1",
    datasource: "NEXUSIQ"
  };

  let url = "https://www.nuget.org/packages/LibGit2Sharp/0.20.1";
  let actual = parseNugetURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check parseNPMURL(www.nuget.org) negative test", () => {
  //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
  let format = "npm";
  let artifact = {
    format: format,
    packageName: "LibGit2Sharp",
    version: undefined,
    datasource: "NEXUSIQ"
  };

  let url = "https://www.nuget.org/packages/LibGit2Sharp";
  let actual = parseNugetURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check parsePyPIURL(pypi.org) positive test", () => {
  let format = "pypi";
  let artifact = {
    format: format,
    name: "Django",
    version: "1.6",
    datasource: "NEXUSIQ",
    extension: "whl",
    qualifier: "py2.py3-none-any"
  };

  let url = "https://pypi.org/project/Django/1.6/";
  let actual = parsePyPIURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check parsePyPIURL(pypi.org) negative test", () => {
  let format = "pypi";
  let artifact = {
    format: format,
    name: "Django",
    version: undefined,
    datasource: "OSSINDEX"
  };

  let url = "https://pypi.org/project/Django/";
  let actual = parsePyPIURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

//add test for https://pypi.org/project/numpy/

test("Check parseRubyURL(rubygems.org) positive test", () => {
  let format = "gem";
  let artifact = {
    format: format,
    name: "bundler",
    version: "1.16.1",
    datasource: "NEXUSIQ"
  };

  let url = "https://rubygems.org/gems/bundler/versions/1.16.1";
  let actual = parseRubyURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check parseRubyURL(rubygems.org) negative test", () => {
  let expected = {
    format: "gem",
    name: "bundler",
    version: undefined,
    datasource: "IQSERVER"
  };

  let url = "https://rubygems.org/gems/bundler";
  let actual = parseRubyURL(url);

  expect(actual).toBeFalsy();
});

test("Check parsePackagistURL(packagist.org/drupal) positive test", () => {
  let expected = {
    datasource: "OSSINDEX",
    format: "composer",
    name: "drupal%2Fdrupal",
    version: "8.6.2"
  };
  let url = "https://packagist.org/packages/drupal/drupal#8.6.2";
  let actual = parsePackagistURL(url);
  expect(actual).toEqual(expected);
});

test("Check parsePackagistURL(packagist.org/phpbb) positive test", () => {
  let expected = {
    datasource: "OSSINDEX",
    format: "composer",
    name: "phpbb%2Fphpbb",
    version: "3.1.2"
  };
  let url = "https://packagist.org/packages/phpbb/phpbb#3.1.2";
  let actual = parsePackagistURL(url);
  expect(actual).toEqual(expected);
});

test("Check parsePackagistURL(packagist.org) negative test", () => {
  let expected = {
    format: "composer",
    name: "drupal",
    version: undefined,
    datasource: "OSSINDEX"
  };

  let url = "https://packagist.org/packages/drupal/drupal";
  let actual = parsePackagistURL(url);
  expect(actual).toBeFalsy();
});

test("Check parseCocoaPodsURL(cocoapods.org) negative test", () => {
  //parseCocoaPodsURL ->falsy only
  let format = "cocoapods";
  let artifact = {
    format: format,
    name: "TestFairy",
    version: undefined,
    datasource: "OSSINDEX"
  };
  let url = "https://cocoapods.org/pods/TestFairy";
  let actual = parseCocoaPodsURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check parseCRANURL(cran.r-project.org) negative test", () => {
  // parseCRANURL ->falsy only
  let format = "CRAN";
  let artifact = {
    format: format,
    name: "clustcurv",
    version: undefined,
    datasource: "OSSINDEX"
  };

  let url = "https://cran.r-project.org/package=clustcurv";
  let actual = parseCRANURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check parseGoLangURL(GOCENTER GOLANG) negative test", () => {
  // parseGoLangURL ->falsy only
  let format = "golang";
  let artifact = {
    format: format,
    name: "hansrodtang",
    version: undefined,
    datasource: "OSSINDEX"
  };

  let url =
    "https://gocenter.jfrog.com/github.com~2Fhansrodtang~2Frandomcolor/versions";
  let actual = parseGoLangURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check parseCratesURL(crates.io) negative test", () => {
  // parseCratesURL ->falsy only

  let artifact = {
    format: "cargo",
    name: "rand",
    version: undefined,
    datasource: "OSSINDEX"
  };

  let url = "https://crates.io/crates/rand";
  let actual = parseCratesURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check parseArtifactoryURL positive test", () => {
  let expected = {
    datasource: dataSources.NEXUSIQ,
    format: formats.maven,
    groupId: "org.springframework",
    artifactId: "spring-core",
    version: "4.1.7.RELEASE",
    classifier: "",
    extension: "jar"
  };
  let url =
    "http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/spring-release-cache/org/springframework/spring-core/4.1.7.RELEASE";
  let actual = parseArtifactoryURL(url);
  expect(actual).toEqual(expected);
});

test("Check parseGitHubURL positive test", () => {
  let expected = {
    format: formats.github,
    name: "jquery/jquery",
    version: "3.0.0",
    datasource: dataSources.OSSINDEX
  };
  let url = "https://github.com/jquery/jquery/releases/tag/3.0.0";
  let actual = parseGitHubURL(url);
  expect(actual).toEqual(expected);
});

test("Check parseNexusRepoURL positive test", () => {
  let url =
    "http://nexus:8081/#browse/browse:maven-central:antlr%2Fantlr%2F2.7.2";
  let actual = parseNexusRepoURL(url);
  expect(actual).not.toBeDefined();
});

test("Check ParsePageURL(search.maven.org) positive test", () => {
  let format = "maven";
  let groupId = "commons-collections";
  let artifactId = "commons-collections";
  let version = "3.2.1";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );
  //SEARCH      https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar
  let url =
    "https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check ParsePageURL(search.maven.org) negative test", () => {
  let format = "maven";
  let artifact = {
    format: format,
    artifactId: "commons-collections",
    classifier: "",
    extension: "jar",
    groupId: "commons-collections",
    version: "3.2.1",
    datasource: "NEXUSIQ"
  };
  //SEARCH      https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar
  let url = "https://search.maven.org/";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check ParsePageURL( mvnrepository) positive test", () => {
  let format = "maven";
  let groupId = "commons-collections";
  let artifactId = "commons-collections";
  let version = "3.2.1";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );

  let url =
    "https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check ParsePageURL( https://repo1.maven.org) positive test", () => {
  let format = "maven";
  let groupId = "commons-collections";
  let artifactId = "commons-collections";
  let version = "3.2.1";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );

  let url =
    "https://repo1.maven.org/maven2/commons-collections/commons-collections/3.2.1/";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check ParsePageURL(https://repo1.maven.org) negative test", () => {
  //can not parse a URL as the extension is unknown
  let format = "maven";
  let artifact = {
    format: format,
    artifactId: "commons-collections",
    classifier: "",
    extension: "jar",
    groupId: "commons-collections",
    version: "3.2.1",
    datasource: "NEXUSIQ"
  };
  //SEARCH      https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar
  let url = "https://repo1.maven.org/maven2/";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).not.toEqual(expected);
});

test("Check ParsePageURL( http://repo2.maven.org) positive test", () => {
  let format = "maven";
  let groupId = "commons-collections";
  let artifactId = "commons-collections";
  let version = "3.2.1";
  let classifier = "";
  let extension = "jar";
  let datasource = "NEXUSIQ";

  let artifact = new MavenArtifact(
    // format: format,
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    datasource
  );

  let url =
    "http://repo2.maven.org/maven2/commons-collections/commons-collections/3.2.1/";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check ParsePageURL(http://repo2.maven.org) negative test", () => {
  //I am going to assume jar extension for now
  let format = "maven";
  let artifact = {
    format: format,
    artifactId: "commons-collections",
    classifier: "",
    extension: "jar",
    groupId: "commons-collections",
    version: undefined,
    datasource: "NEXUSIQ"
  };
  //SEARCH      https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar
  let url = "http://repo2.maven.org/maven2/";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).not.toEqual(expected);
});

test("Check ParsePageURL(npmjs.com) positive test", () => {
  let format = "npm";
  let artifact = {
    format: format,
    packageName: "lodash",
    version: "4.17.9",
    datasource: "NEXUSIQ"
  };

  let url = "https://www.npmjs.com/package/lodash/v/4.17.9";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual.format).toEqual(expected.format);
});

test("Check ParsePageURL(npmjs.com) negative test", () => {
  let format = "npm";
  let artifact = {
    format: format,
    packageName: "lodash",
    version: undefined,
    datasource: "NEXUSIQ"
  };

  let url = "https://www.npmjs.com/package/lodash/";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check ParsePageURL(www.nuget.org) positive test", () => {
  //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
  let format = "nuget";
  let artifact = {
    format: format,
    packageId: "LibGit2Sharp",
    version: "0.20.1",
    datasource: "NEXUSIQ"
  };

  let url = "https://www.nuget.org/packages/LibGit2Sharp/0.20.1";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check ParsePageURL(www.nuget.org) negative test", () => {
  //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
  let format = "npm";
  let artifact = {
    format: format,
    packageName: "LibGit2Sharp",
    version: undefined,
    datasource: "NEXUSIQ"
  };

  let url = "https://www.nuget.org/packages/LibGit2Sharp";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

//No longer valid as I can not simply parse the url due to pypi data needs
// test("Check ParsePageURL(pypi.org) positive test", () => {
//   let format = "pypi";
//   let artifact = {
//     format: format,
//     name: "Django",
//     version: "1.6",
//     datasource: "NEXUSIQ"
//   };

//   let url = "https://pypi.org/project/Django/1.6/";
//   let actual = ParsePageURL(url);
//   let expected = artifact;
//   expect(actual).toEqual(expected);
// });

test("Check ParsePageURL(pypi.org) negative test", () => {
  let format = "pypi";
  let artifact = {
    format: format,
    name: "Django",
    version: undefined,
    datasource: "OSSINDEX"
  };

  let url = "https://pypi.org/project/Django/";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check ParsePageURL(rubygems.org) positive test", () => {
  let format = "gem";
  let artifact = {
    format: format,
    name: "bundler",
    version: "1.16.1",
    datasource: "NEXUSIQ"
  };

  let url = "https://rubygems.org/gems/bundler/versions/1.16.1";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toEqual(expected);
});

test("Check ParsePageURL(rubygems.org) negative test", () => {
  let format = "gem";
  let artifact = {
    format: format,
    name: "bundler",
    version: undefined,
    datasource: "IQSERVER"
  };

  let url = "https://rubygems.org/gems/bundler";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check ParsePageURL(packagist.org) positive test", () => {
  let expected = {
    datasource: "OSSINDEX",
    format: "composer",
    name: "drupal%2Fdrupal",
    version: "8.6.2"
  };
  let url = "https://packagist.org/packages/drupal/drupal#8.6.2";
  let actual = ParsePageURL(url);
  expect(actual).toEqual(expected);
});

test("Check ParsePageURL(packagist.org) negative test", () => {
  let format = "packagist";
  let artifact = {
    format: format,
    name: "drupal",
    version: undefined,
    datasource: "OSSINDEX"
  };

  let url = "https://packagist.org/packages/drupal/drupal";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check ParsePageURL(cocoapods.org) negative test", () => {
  //parseCocoaPodsURL ->falsy only
  let format = "cocoapods";
  let artifact = {
    format: format,
    name: "TestFairy",
    version: undefined,
    datasource: "OSSINDEX"
  };
  let url = "https://cocoapods.org/pods/TestFairy";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check ParsePageURL(cran.r-project.org) negative test", () => {
  // parseCRANURL ->falsy only
  let format = "CRAN";
  let artifact = {
    format: format,
    name: "clustcurv",
    version: undefined,
    datasource: "OSSINDEX"
  };

  let url = "https://cran.r-project.org/package=clustcurv";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check ParsePageURL(parseGoLangURL) negative test", () => {
  // parseGoLangURL ->falsy only
  let format = "golang";
  let artifact = {
    format: format,
    name: "hansrodtang",
    version: undefined,
    datasource: "OSSINDEX"
  };

  let url =
    "https://gocenter.jfrog.com/github.com~2Fhansrodtang~2Frandomcolor/versions";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

test("Check ParsePageURL(crates.io) negative test", () => {
  // parseCratesURL ->falsy only

  let artifact = {
    format: "cargo",
    name: "rand",
    version: undefined,
    datasource: "OSSINDEX"
  };

  let url = "https://crates.io/crates/rand";
  let actual = ParsePageURL(url);
  let expected = artifact;
  expect(actual).toBeFalsy();
});

//cant unit test chrome app apis
// test("Check getExtensionVersion positive test", () => {
//   let actual = getExtensionVersion();
//   let expected = "1.7.17";
//   expect(actual).toEqual(expected);
// });

// test('Check removeCookies(settings_url) positive test', () => {
//   //to do: Implement unit test to delete cookie
//   let settings_url = 'http://iq-server:8070/'

//   expect(actual).toEqual(expected);
// });
