// import BuildEmptySettings from '../Scripts/util';
const {
  BuildEmptySettings, 
  checkPageIsHandled,
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
  ParsePageURL
  
  

} = require('../Scripts/utils');

test('Can build empty Settings', () => {
    let actual = BuildEmptySettings();
    let expected = {
        username : "",
        password : "",
        tok : "",
        hash : "",
        auth : "",
        restEndPoint : "",
        baseURL : "",
        url : "",
        loginEndPoint: "",
        loginurl: ""
    }
  expect(expected).toEqual(actual);
});



test('CheckPageIsHandled positive test - maven', () => {
  let actual = checkPageIsHandled('https://search.maven.org/');
  let expected = true;
  expect(expected).toBe(actual);
});

test('CheckPageIsHandled positive test - maven', () => {
  let actual = checkPageIsHandled('https://mvnrepository.com/');
  let expected = true;
  expect(expected).toBe(actual);
});
test('CheckPageIsHandled positive test - nuget', () => {
  let actual = checkPageIsHandled('https://www.nuget.org/');
  let expected = true;
  expect(expected).toBe(actual);
});


test('CheckPageIsHandled positive test - NPM', () => {
  let actual = checkPageIsHandled('https://www.npmjs.com/');
  let expected = true;
  expect(expected).toBe(actual);
});

test('CheckPageIsHandled positive test - https://rubygems.org/', () => {
  let actual = checkPageIsHandled('https://rubygems.org/');
  let expected = true;
  expect(expected).toBe(actual);
});
 
test('CheckPageIsHandled positive test - https://pypi.org/', () => {
  let actual = checkPageIsHandled('https://pypi.org/');
  let expected = true;
  expect(expected).toBe(actual);
});
 
test('CheckPageIsHandled positive test - https://packagist.org/', () => {
  let actual = checkPageIsHandled('https://packagist.org/');
  let expected = true;
  expect(expected).toBe(actual);
});
 

test('CheckPageIsHandled positive test - CRAN', () => {
  let actual = checkPageIsHandled('https://cran.r-project.org/');
  let expected = true;
  expect(expected).toBe(actual);
});

test('CheckPageIsHandled positive test - Crates', () => {
  let actual = checkPageIsHandled('https://crates.io/');
  let expected = true;
  expect(expected).toBe(actual);
});


test('CheckPageIsHandled positive test - gocenter', () => {
  let actual = checkPageIsHandled('https://gocenter.jfrog.com/');
  let expected = true;
  expect(expected).toBe(actual);
});




test('CheckPageIsHandled negative test - Google', () => {
  let actual = checkPageIsHandled('http://www.google.com');
  let expected = false;
  expect(expected).toBe(actual);
});




test('Check NexusFormatMaven positive test', () => {
  let artifact = {
    format: "maven", 
    groupId: "commons-collections", 
    artifactId: "commons-collections",  
    version: "3.2.1", 
    extension: "jar",
    classifier: ""
  }
  let actual = NexusFormatMaven(artifact);
  let expected = {
    components:[	
      component = {
        hash: null, 
        componentIdentifier: 
          {
          format: artifact.format,
          coordinates : 
            {
              groupId: artifact.groupId, 
              artifactId: artifact.artifactId, 
              version : artifact.version,
              extension: artifact.extension,
              classifier: artifact.classifier
            }
          }
        }
      ]
    };
  expect(expected).toEqual(actual);
});


test('Check NexusFormatNPM positive test', () => {  
  let artifact = {
    format: "npm", 
    packageName: "lodash", 
    version: "4.17.11"
  }
  let actual = NexusFormatNPM(artifact);
  let expected  = {
    "components":[
        component = {
            "hash": null, 
            "componentIdentifier": 
                {
                "format": artifact.format,
                "coordinates" : 
                    {
                        "packageId": artifact.packageName, 
                        "version" : artifact.version
                    }
                }
          }
        ]
    }
  expect(expected).toEqual(actual);
});



test('Check NexusFormatNuget positive test', () => {
  let artifact = {
    format: "nuget", 
    packageId: "LibGit2Sharp", 
    version: "0.1.0"
  }
  let actual =  NexusFormatNuget(artifact);
	//return a dictionary in Nexus Format ofr Nuget
    //return dictionary of components
    let expected = {
        "components":[
            component = {
                "hash": null, 
                "componentIdentifier": {
                    "format": artifact.format,
                    "coordinates" : {
                        "packageId": artifact.packageId, 
                        "version" : artifact.version
                        }
                    }
                }
            ]
        }
        expect(expected).toEqual(actual);
});



test('Check NexusFormatPyPI positive test', () => {
  let artifact = {
    format: "pypi", 
    packageId: "Django",
    version: "1.6"
  }
  let actual = NexusFormatPyPI(artifact)
	//return a dictionary in Nexus Format
    //return dictionary of components
    //TODO: how to determine the qualifier and the extension??
    let expected = {
      "components":[
            component = {
                "hash": null, 
                "componentIdentifier": 
                    {
                    "format": artifact.format,
                    "coordinates" : 
                        {
                            "name": artifact.name, 
                            "qualifier": 'py2.py3-none-any',
                            "version" : artifact.version,
                            "extension" : 'whl'
                        }
                    }
            }
        ]
    }
    expect(expected).toEqual(actual);
});

test('Check NexusFormatRuby positive test', () => {
  let artifact = {
    format: "gem", 
    packageId: "bundler ",
    version: "2.0.1"
  }
  let actual =  NexusFormatRuby(artifact)
	//return a dictionary in Nexus Format
    //return dictionary of components
    //TODO: how to determine the qualifier and the extension??
    let expected = {
      "components":[	
        component = {
          "hash": null, 
          "componentIdentifier": 
            {
            "format": artifact.format,
            "coordinates" : 
              {
                "name": artifact.name, 
                "version" : artifact.version
              }
            }
          }
        ]
      }
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




test('Check epochToJsDate positive test', () => {
  let ts = 1554116734
  let actual =  epochToJsDate(ts)
	let expected = new Date('2019-04-01T11:05:34.000Z') //UTC
  expect(expected).toEqual(actual);
});

test('Check jsDateToEpoch positive test', () => {
  let baseDate = new Date('2019-04-01T11:05:34.000Z') //UTC
  let actual =  jsDateToEpoch(baseDate)
	let expected = 1554116734
  expect(expected).toEqual(actual);
});


test('jsDateToEpoch on Error', () => {
  const t = () => {
    // throw new TypeError();
    // jsDateToEpoch('junk');
    // expect(badDate).toThrowError(new Error('Bad date passed in'));
    expect(() => {jsDateToEpoch('junk')}).toThrow(TypeError);
  };
});


test('Check encodeComponentIdentifier maven - encoder', () => {
  let artifact = {
    format:"maven",    
    artifactId:"springfox-swagger-ui",
    classifier:"",
    extension:"jar",
    groupId:"io.springfox",
    version:"2.6.1"    
  }
  let nexusArtifact = NexusFormatMaven(artifact)
  // let actual =  encodeURIComponent(JSON.stringify(artifact))
  let actual = encodeComponentIdentifier(nexusArtifact);
  let expected = '%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22groupId%22%3A%22io.springfox%22%2C%22artifactId%22%3A%22springfox-swagger-ui%22%2C%22version%22%3A%222.6.1%22%2C%22extension%22%3A%22jar%22%2C%22classifier%22%3A%22%22%7D%7D'
  //let ereceived = '%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22groupId%22%3A%22io.springfox%22%2C%22artifactId%22%3A%22springfox-swagger-ui%22%2C%22version%22%3A%222.6.1%22%2C%22extension%22%3A%22jar%22%7D%7D'
  //let expected = '%7B%22format%22%3A%22maven%22%2C%22coordinates%22%3A%7B%22artifactId%22%3A%22springfox-swagger-ui%22%2C%22classifier%22%3A%22%22%2C%22extension%22%3A%22jar%22%2C%22groupId%22%3A%22io.springfox%22%2C%22version%22%3A%222.6.1%22%7D%7D'
  expect(actual).toBe(expected);
  // expect(1).toBe(1);
});



test('Check parseMavenURL(format, search.maven.org) positive test', () => {
  let format = 'maven'
  let artifact = {
    format: format,    
    artifactId: "commons-collections",
    classifier:"",
    extension:"jar",
    groupId: "commons-collections",
    version: "3.2.1",
    datasource: "NEXUSIQ"
  }

  //SEARCH      https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar

  let  url = 'https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar'
  let actual = parseMavenURL(url);
  let expected = artifact
  expect(actual).toEqual(expected);
  
});


test('Check parseMavenURL(format, mvnrepository) positive test', () => {
  let format = 'maven'
  let artifact = {
    format: format,    
    artifactId: "commons-collections",
    classifier:"",
    extension:"jar",
    groupId: "commons-collections",
    version: "3.2.1",
    datasource: "NEXUSIQ"
  }


  let  url = 'https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1'
  let actual = parseMavenURL( url);
  let expected = artifact
  expect(actual).toEqual(expected);
  
});




test('Check parseNPMURL(npmjs.com) positive test', () => {
  let format = 'npm'
  let artifact = {
    format: format,    
    packageName: 'lodash', 
    version: '4.17.9',
    datasource: 'NEXUSIQ'
  }


  let  url = 'https://www.npmjs.com/package/lodash/v/4.17.9'
  let actual = parseNPMURL( url);
  let expected = artifact
  expect(actual).toEqual(expected);
  
});

test('Check parseNPMURL(npmjs.com) negative test', () => {
  let format = 'npm'
  let artifact = {
    format: format,    
    packageName: 'lodash', 
    version: undefined,
    datasource: 'NEXUSIQ'
  }


  let  url = 'https://www.npmjs.com/package/lodash/'
  let actual = parseNPMURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
  
});


test('Check parseNPMURL(www.nuget.org) positive test', () => {
  //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
  let format = 'nuget'
  let artifact = {
    format: format,    
    packageId: 'LibGit2Sharp', 
    version: '0.20.1',
    datasource: 'NEXUSIQ'
  }


  let  url = 'https://www.nuget.org/packages/LibGit2Sharp/0.20.1'
  let actual = parseNugetURL( url);
  let expected = artifact
  expect(actual).toEqual(expected);
});


test('Check parseNPMURL(www.nuget.org) negative test', () => {
  //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
  let format = 'npm'
  let artifact = {
    format: format,    
    packageName: 'LibGit2Sharp', 
    version: undefined,
    datasource: 'NEXUSIQ'
  }


  let  url = 'https://www.nuget.org/packages/LibGit2Sharp'
  let actual = parseNugetURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});




test('Check parsePyPIURL(pypi.org) positive test', () => {
  let format = 'pypi'
  let artifact = {
    format: format,    
    name: 'Django', 
    version: '1.6',
    datasource: 'NEXUSIQ'
  }

  let  url = 'https://pypi.org/project/Django/1.6/'
  let actual = parsePyPIURL(url);
  let expected = artifact
  expect(actual).toEqual(expected);
});


test('Check parsePyPIURL(pypi.org) negative test', () => {
  let format = 'pypi'
  let artifact = {
    format: format,    
    name: 'Django', 
    version: undefined,
    datasource: 'OSSINDEX'
  }


  let  url = 'https://pypi.org/project/Django/'
  let actual = parsePyPIURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});



test('Check parseRubyURL(rubygems.org) positive test', () => {
  let format = 'gem'
  let artifact = {
    format: format,    
    name: 'bundler', 
    version: '1.16.1',
    datasource: 'NEXUSIQ'
  }

  let  url = 'https://rubygems.org/gems/bundler/versions/1.16.1'
  let actual = parseRubyURL(url);
  let expected = artifact
  expect(actual).toEqual(expected);
});


test('Check parseRubyURL(rubygems.org) negative test', () => {
  let format = 'gem'
  let artifact = {
    format: format,    
    name: 'bundler', 
    version: undefined,
    datasource: 'IQSERVER'
  }


  let  url = 'https://rubygems.org/gems/bundler'
  let actual = parseRubyURL( url);
  let expected = artifact
  expect(actual).toBeFalsy();
});



test('Check parsePackagistURL(packagist.org) positive test', () => {
  let format = 'packagist'
  let artifact = {
    datasource: 'OSSINDEX',
    format: format,    
    name: 'drupal%2Fdrupal%238.6.2',  
    version: '8.6.2',
  }
  let  url = 'https://packagist.org/packages/drupal/drupal#8.6.2'
  let actual = parsePackagistURL(url);
  let expected = artifact
  expect(actual).toEqual(expected);
});

test('Check parsePackagistURL(packagist.org) negative test', () => {
  let format = 'packagist'
  let artifact = {
    format: format,    
    name: 'drupal', 
    version: undefined,
    datasource: 'OSSINDEX'
  }


  let  url = 'https://packagist.org/packages/drupal/drupal'
  let actual = parsePackagistURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});


test('Check parseCocoaPodsURL(cocoapods.org) negative test', () => {
  //parseCocoaPodsURL ->falsy only
  let format = 'cocoapods'
  let artifact = {
    format: format,    
    name: 'TestFairy', 
    version: undefined,
    datasource: 'OSSINDEX'

  }
  let  url = 'https://cocoapods.org/pods/TestFairy'
  let actual = parseCocoaPodsURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});



test('Check parseCRANURL(cran.r-project.org) negative test', () => {
  // parseCRANURL ->falsy only
  let format = 'CRAN'
  let artifact = {
    format: format,    
    name: 'clustcurv', 
    version: undefined,
    datasource: 'OSSINDEX'

  }
  
  let  url = 'https://cran.r-project.org/package=clustcurv'
  let actual = parseCRANURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});



test('Check parseGoLangURL(cran.r-project.org) negative test', () => {
  // parseGoLangURL ->falsy only
  let format = 'golang'
  let artifact = {
    format: format,    
    name: 'hansrodtang', 
    version: undefined,
    datasource: 'OSSINDEX'

  }
  
  let  url = 'https://gocenter.jfrog.com/github.com~2Fhansrodtang~2Frandomcolor/versions'
  let actual = parseGoLangURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});



test('Check parseCratesURL(crates.io) negative test', () => {
  // parseCratesURL ->falsy only
  let format = 'crates'
  let artifact = {
    format: format,    
    name: 'rand', 
    version: undefined,
    datasource: 'OSSINDEX'

  }
  
  let  url = 'https://crates.io/crates/rand'
  let actual = parseCratesURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});




test('Check ParsePageURL(search.maven.org) positive test', () => {
  let format = 'maven'
  let artifact = {
    format: format,    
    artifactId: "commons-collections",
    classifier:"",
    extension:"jar",
    groupId: "commons-collections",
    version: "3.2.1",
    datasource: "NEXUSIQ"

  }
  //SEARCH      https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar
  let  url = 'https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toEqual(expected);  
});


test('Check ParsePageURL(search.maven.org) negative test', () => {
  let format = 'maven'
  let artifact = {
    format: format,    
    artifactId: "commons-collections",
    classifier:"",
    extension:"jar",
    groupId: "commons-collections",
    version: "3.2.1",
    datasource: "NEXUSIQ"

  }
  //SEARCH      https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar
  let  url = 'https://search.maven.org/'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();  
});


test('Check ParsePageURL( mvnrepository) positive test', () => {
  let format = 'maven'
  let artifact = {
    format: format,    
    artifactId: "commons-collections",
    classifier:"",
    extension:"jar",
    groupId: "commons-collections",
    version: "3.2.1",
    datasource: "NEXUSIQ"
  }


  let  url = 'https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1'
  let actual = ParsePageURL( url);
  let expected = artifact
  expect(actual).toEqual(expected);
  
});




test('Check ParsePageURL(npmjs.com) positive test', () => {
  let format = 'npm'
  let artifact = {
    format: format,    
    packageName: 'lodash', 
    version: '4.17.9',
    datasource: 'NEXUSIQ'
  }


  let  url = 'https://www.npmjs.com/package/lodash/v/4.17.9'
  let actual = ParsePageURL( url);
  let expected = artifact
  expect(actual).toEqual(expected);
  
});

test('Check ParsePageURL(npmjs.com) negative test', () => {
  let format = 'npm'
  let artifact = {
    format: format,    
    packageName: 'lodash', 
    version: undefined,
    datasource: 'NEXUSIQ'
  }


  let  url = 'https://www.npmjs.com/package/lodash/'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
  
});


test('Check ParsePageURL(www.nuget.org) positive test', () => {
  //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
  let format = 'nuget'
  let artifact = {
    format: format,    
    packageId: 'LibGit2Sharp', 
    version: '0.20.1',
    datasource: 'NEXUSIQ'
  }


  let  url = 'https://www.nuget.org/packages/LibGit2Sharp/0.20.1'
  let actual = ParsePageURL( url);
  let expected = artifact
  expect(actual).toEqual(expected);
});


test('Check ParsePageURL(www.nuget.org) negative test', () => {
  //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
  let format = 'npm'
  let artifact = {
    format: format,    
    packageName: 'LibGit2Sharp', 
    version: undefined,
    datasource: 'NEXUSIQ'
  }


  let  url = 'https://www.nuget.org/packages/LibGit2Sharp'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});




test('Check ParsePageURL(pypi.org) positive test', () => {
  let format = 'pypi'
  let artifact = {
    format: format,    
    name: 'Django', 
    version: '1.6',
    datasource: 'NEXUSIQ'
  }

  let  url = 'https://pypi.org/project/Django/1.6/'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toEqual(expected);
});


test('Check ParsePageURL(pypi.org) negative test', () => {
  let format = 'pypi'
  let artifact = {
    format: format,    
    name: 'Django', 
    version: undefined,
    datasource: 'OSSINDEX'
  }


  let  url = 'https://pypi.org/project/Django/'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});



test('Check ParsePageURL(rubygems.org) positive test', () => {
  let format = 'gem'
  let artifact = {
    format: format,    
    name: 'bundler', 
    version: '1.16.1',
    datasource: 'NEXUSIQ'
  }

  let  url = 'https://rubygems.org/gems/bundler/versions/1.16.1'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toEqual(expected);
});


test('Check ParsePageURL(rubygems.org) negative test', () => {
  let format = 'gem'
  let artifact = {
    format: format,    
    name: 'bundler', 
    version: undefined,
    datasource: 'IQSERVER'
  }


  let  url = 'https://rubygems.org/gems/bundler'
  let actual = ParsePageURL( url);
  let expected = artifact
  expect(actual).toBeFalsy();
});



test('Check ParsePageURL(packagist.org) positive test', () => {
  let format = 'packagist'
  let artifact = {
    datasource: 'OSSINDEX',
    format: format,    
    name: 'drupal%2Fdrupal%238.6.2',  
    version: '8.6.2',
  }
  let  url = 'https://packagist.org/packages/drupal/drupal#8.6.2'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toEqual(expected);
});

test('Check ParsePageURL(packagist.org) negative test', () => {
  let format = 'packagist'
  let artifact = {
    format: format,    
    name: 'drupal', 
    version: undefined,
    datasource: 'OSSINDEX'
  }


  let  url = 'https://packagist.org/packages/drupal/drupal'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});


test('Check ParsePageURL(cocoapods.org) negative test', () => {
  //parseCocoaPodsURL ->falsy only
  let format = 'cocoapods'
  let artifact = {
    format: format,    
    name: 'TestFairy', 
    version: undefined,
    datasource: 'OSSINDEX'

  }
  let  url = 'https://cocoapods.org/pods/TestFairy'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});



test('Check ParsePageURL(cran.r-project.org) negative test', () => {
  // parseCRANURL ->falsy only
  let format = 'CRAN'
  let artifact = {
    format: format,    
    name: 'clustcurv', 
    version: undefined,
    datasource: 'OSSINDEX'

  }
  
  let  url = 'https://cran.r-project.org/package=clustcurv'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});



test('Check ParsePageURL(cran.r-project.org) negative test', () => {
  // parseGoLangURL ->falsy only
  let format = 'golang'
  let artifact = {
    format: format,    
    name: 'hansrodtang', 
    version: undefined,
    datasource: 'OSSINDEX'

  }
  
  let  url = 'https://gocenter.jfrog.com/github.com~2Fhansrodtang~2Frandomcolor/versions'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});



test('Check ParsePageURL(crates.io) negative test', () => {
  // parseCratesURL ->falsy only
  let format = 'crates'
  let artifact = {
    format: format,    
    name: 'rand', 
    version: undefined,
    datasource: 'OSSINDEX'

  }
  
  let  url = 'https://crates.io/crates/rand'
  let actual = ParsePageURL(url);
  let expected = artifact
  expect(actual).toBeFalsy();
});

// test('Check removeCookies(settings_url) positive test', () => {
//   //to do: Implement unit test to delete cookie
//   let settings_url = 'http://iq-server:8070/'
  
//   expect(actual).toEqual(expected);
// });
