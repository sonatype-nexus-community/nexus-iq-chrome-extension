// import BuildEmptySettings from '../Scripts/util';
const {
  BuildEmptySettings, 
  checkPageIsHandled,
  NexusFormatMaven,
  NexusFormatNPM,
  NexusFormatNuget,
  NexusFormatPyPI,
  NexusFormatRuby
  
  

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


test('CheckPageIsHandled negative test - Google', () => {
  let actual = checkPageIsHandled('http://www.google.com');
  let expected = false;
  expect(expected).toBe(actual);
});

test('CheckPageIsHandled positive test - NPM', () => {
  let actual = checkPageIsHandled('https://www.npmjs.com/');
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




test('Check NexusFormatMaven positive test', () => {
  let artifact = {
    format: "maven", 
    groupId: "commons-collections", 
    artifactId: "commons-collections",  
    version: "3.2.1", 
    extension: "jar"
  }
  let actual = NexusFormatMaven(artifact);
  let expected = {
    "components":[	
      component = {
        "hash": null, 
        "componentIdentifier": 
          {
          "format": artifact.format,
          "coordinates" : 
            {
              "groupId": artifact.groupId, 
              "artifactId": artifact.artifactId, 
                          "version" : artifact.version,
                          'extension': artifact.extension
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