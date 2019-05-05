console.log('utils.js');

var formats = {
    maven: "maven",
    npm: "npm",
    nuget: "nuget",
    gem: "gem",
    pypi: "pypi",
    composer: "composer", //packagist website but composer format
    cocoapods: "cocoapods",
    cran: "cran",
    cargo: "cargo", //cargo == crates 
    golang: "golang"
}
  

const dataSources = {
    NEXUSIQ: 'NEXUSIQ',
    OSSINDEX: 'OSSINDEX'
}

var messageTypes = {
    login: "login",  //message to send that we are in the process of logging in
    evaluate: "evaluate",  //message to send that we are evaluating
    loggedIn:"loggedIn",    //message to send that we are in the loggedin
    displayMessage: "displayMessage",  //message to send that we have data from REST and wish to display it
    loginFailedMessage: "loginFailedMessage",  //message to send that login failed
    beginevaluate: "beginevaluate",  //message to send that we are beginning the evaluation process, it's different to the evaluatew message for a readon that TODO I fgogot
    artifact: "artifact" //passing a artifact/package identifier from content to the background to kick off the eval

};



function checkPageIsHandled(url){
    console.log("checkPageIsHandled")
    console.log(url)
    //check the url of the tab is in this collection
    // let url = tab.url
    let found = false
    if (url.search("https://search.maven.org/") >= 0 ||
        url.search("https://mvnrepository.com/") >= 0 ||
        url.search("https://www.npmjs.com/") >= 0 ||
        url.search("https://www.nuget.org/") >= 0 ||
        url.search("https://rubygems.org/") >= 0 ||
        url.search("https://pypi.org/") >= 0 ||
        url.search("https://packagist.org/") >= 0 ||
        url.search("https://cran.r-project.org/") >= 0 ||
        url.search("https://crates.io/") >= 0 ||
        url.search("https://gocenter.jfrog.com/") >= 0        
        ) 
        {
            found = true;
        }
    return found;
}


function ParsePageURL(url){
    //artifact varies depending on eco-system
    //returns an artifact if URL contains the version
    //if not a version specific URL then returns a falsy value
    console.log('ParsePageURL');
    //who I am what is my address?
    let artifact;
    let format;
    console.log(url);

    if (url.search('search.maven.org/artifact/') >=0){
        //https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar  
        format = formats.maven;
        artifact = parseMavenURL(url);

    }
    else if (url.search('https://mvnrepository.com/artifact/') >=0){
        //https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
        format = formats.maven;
        artifact = parseMavenURL(url);
    }

    else if (url.search('www.npmjs.com/package/') >= 0){
      //'https://www.npmjs.com/package/lodash'};
      format = formats.npm;
      artifact = parseNPMURL(url);
    }
    else if (url.search('nuget.org/packages/') >=0){
      //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
      format = formats.nuget;
      artifact =  parseNugetURL( url);

    }    
    
    else if (url.search('pypi.org/project/') >=0){
      //https://pypi.org/project/Django/1.6/
      format = formats.pypi;
      artifact = parsePyPIURL(url);

    }
    
    else if (url.search('rubygems.org/gems/') >=0){
      //https://rubygems.org/gems/bundler/versions/1.16.1
      format = formats.gem;
      artifact = parseRubyURL(url);

    }
    
    //OSSIndex
    else if (url.search('packagist.org/packages/') >=0){
      //https: packagist ???
      format = formats.composer;
      
      artifact = parsePackagistURL(url);

    }
    else if (url.search('cocoapods.org/pods/') >=0){
      //https:// cocoapods ???
      format = formats.cocoapods;
      
      artifact = parseCocoaPodsURL(url);

    }
    else if (url.search('cran.r-project.org/') >=0){      
      format = formats.cran;
      
      artifact = parseCRANURL(url);
    }
    
    else if (url.search('https://crates.io/crates/') >=0){      
      format = formats.cargo;
      artifact = parseCratesURL(url);
    }
    else if (url.search('https://gocenter.jfrog.com/') >=0){      
      format = formats.golang;
      artifact = parseGoLangURL(url);
    }

    console.log("ParsePageURL Complete");
    console.log(artifact);
    //now we write this to background as
    //we pass variables through background
    return artifact;
};



function BuildEmptySettings(){
    let settings = {
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
    return settings;
}

function removeCookies(settings_url){
    console.log('removeCookies')
    console.log(settings_url)
    //settings.url = http://iq-server:8070/
    let leftPart = settings_url.search('//')+2;
    let server = settings_url.substring(leftPart);
    let rightPart = server.search(':')-1;
    if (rightPart < 0){
        rightPart = server.search(leftPart, '/')-1;
        if (rightPart < 0){
            rightPart = server.length;
        }
    }
    server = server.substring(0, rightPart+1)
    //".iq-server"
    let domain = "." + server;
    chrome.cookies.getAll({domain: domain}, function(cookies) {
        console.log('here');
        for(var i=0; i<cookies.length;i++) {
          console.log(cookies[i]);
    
          chrome.cookies.remove({url: settings_url, name: cookies[i].name});
        }
      });
    //the only one to remove is this one.
    chrome.cookies.remove({url: settings_url, name: "CLMSESSIONID"});  
}

function NexusFormat(artifact){
    let format = artifact.format;
    switch (format){
        case formats.npm:
            requestdata = NexusFormatNPM(artifact);
            break;
        case formats.maven:
            requestdata = NexusFormatMaven(artifact);
            break;
        case formats.gem:
            requestdata = NexusFormatRuby(artifact);
            break;
        case formats.pypi:
            requestdata = NexusFormatPyPI(artifact);
            break;
        case formats.nuget:
            requestdata = NexusFormatNuget(artifact);
            break;
        
        default:
            return;
            break;
    }
    return requestdata;
}

function NexusFormatMaven(artifact){  
	//return a dictionary in Nexus Format
    //return dictionary of components
    componentDict = {components:[	
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
                        classifier: ""
					}
				}
            }
        ]
    }
    return componentDict
};
function NexusFormatNPM(artifact){  
	//return a dictionary in Nexus Format
    //return dictionary of components
    componentDict = {"components":[	
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
	return componentDict
};
function NexusFormatNuget(artifact){
	//return a dictionary in Nexus Format ofr Nuget
    //return dictionary of components
    componentDict = {
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
	return componentDict
};
function NexusFormatPyPI(artifact){
	//return a dictionary in Nexus Format
    //return dictionary of components
    //TODO: how to determine the qualifier and the extension??
    componentDict = {"components":[	

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
	return componentDict
};
function NexusFormatRuby(artifact){
	//return a dictionary in Nexus Format
    //return dictionary of components
    //TODO: how to determine the qualifier and the extension??
    componentDict = {"components":[	
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
	return componentDict
};

function epochToJsDate(ts){
    // ts = epoch timestamp
    // returns date obj
    return new Date(ts*1000);
  }
  
function jsDateToEpoch(d){
    // d = javascript date obj
    // returns epoch timestamp
    console.log(d)
    if(!(d instanceof Date)){
        throw new TypeError('Bad date passed in');
    }
    else{
        return (d.getTime()-d.getMilliseconds())/1000;
    }
}

function encodeComponentIdentifier(nexusArtifact){
    let actual =  encodeURIComponent(JSON.stringify(nexusArtifact.components[0].componentIdentifier))
    console.log(actual);
    return actual;
}


function parseMavenURL(url) {
    console.log('parseMavenURL')      
      //maven repo https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
      //SEARCH      https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar
      //CURRENTLY both have the same format in the URL version, except maven central also has the packaging type  
      let format = formats.maven;
      let datasource = dataSources.NEXUSIQ;

      let elements = url.split('/')
      let groupId = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);
      groupId = encodeURIComponent(groupId);
      let artifactId = elements[5];
      artifactId = encodeURIComponent(artifactId);
    
      let version = elements[6];
      version = encodeURIComponent(version);
      
      let extension = elements[7];
      if (typeof extension === "undefined"){
        //mvnrepository doesnt have it
        extension = "jar"
      }
      extension = encodeURIComponent(extension);
      let classifier = "";
      let artifact = {
          format: format, 
          groupId:groupId, 
          artifactId:artifactId, 
          version:version, 
          extension: extension,
          classifier: classifier,
          datasource: datasource
        }
      return artifact;
};

function parseNPMURL(url) {
    //ADD SIMPLE CODE THAT Check THE URL
    //this is run outside of the content page
    //so can not see the dom
    //need to handle when the component has a slash in the name
    //https://www.npmjs.com/package/@angular/animation/v/4.0.0-beta.8
    let format = formats.npm;
    let datasource = dataSources.NEXUSIQ;

    let packageName
    let version
    let artifact = ""
    if (url.search('/v/') >0 ){
      //has version in URL
      var urlElements = url.split('/');
      if (urlElements.length>=8){
        packageName = urlElements[4] +'/'+ urlElements[5];
        version = urlElements[7]
        // packageName = encodeURIComponent(packageName);
        // version = encodeURIComponent(version);    
      }
      else{
        packageName = urlElements[4]
        version = urlElements[6]
        // packageName = encodeURIComponent(packageName);
        // version = encodeURIComponent(version);    
      }
      artifact = {
          format: format, 
          packageName: packageName, 
          version: version,
          datasource: datasource
        };
    }else{
        artifact = ""
    }
    return artifact;
};

function parseNugetURL(url) {
    //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
    let format = formats.nuget;
    let datasource = dataSources.NEXUSIQ;

    var elements = url.split('/')
    var artifact    = ""
    if (elements.length==6){
      packageId = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);
      version = elements[5];
      packageId = encodeURIComponent(packageId);
      version = encodeURIComponent(version);
      artifact =  {
          format: format, 
          packageId: packageId, 
          version: version,
          datasource: datasource
        }
      }
    else{
        artifact = ""
    }
    return artifact;
};

function parsePyPIURL(url) {
    console.log('parsePyPI');
    //https://pypi.org/project/Django/1.6/
    //return falsy if no version in the URL
    let format = formats.pypi;
    let datasource = dataSources.NEXUSIQ;

    let elements = url.split('/')
    let artifact = ""
    if (elements[5]==""){
        artifact = ""
    }
    else{
      name = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);    
      version = elements[5];
      name = encodeURIComponent(name);
      version = encodeURIComponent(version);
      artifact = {
          format: format, 
          name: name, 
          version: version,
          datasource: datasource
        };
    }
    return artifact;
};

function parseRubyURL(url) {
    console.log('parseRubyURL');
    let format = formats.gem;
    let datasource = dataSources.NEXUSIQ;

    let elements = url.split('/')
    let artifact
    if (elements.length < 6){
        //current version is inside the dom
        //https://rubygems.org/gems/bundler
        //return falsy
        artifact = ""
    }
    else{
        //https://rubygems.org/gems/bundler/versions/1.16.1
        name = elements[4];
        version = elements[6];
        name = encodeURIComponent(name);
        version = encodeURIComponent(version);
        artifact = {
            format: format, 
            name: name, 
            version: version,
            datasource: datasource
        };
    }
    return artifact;
};

function parsePackagistURL(url) {
    //server is packagist, format is composer
    console.log('parsePackagist:' +  url);
    const elements = url.split('/')
    let format = formats.composer;
    let datasource = dataSources.OSSINDEX;

    let artifact
    let name
    let version
    //https://packagist.org/packages/drupal/drupal
    //Specific version is with a hash
    //https://packagist.org/packages/drupal/drupal#8.6.2
    //https://packagist.org/packages/phpbb/phpbb#3.1.2
    let namePt1 = elements[4];
    let namePt2 = elements[5];

    let whereIs = namePt2.search("#")
    //is the version number in the URL? if so get that, else get it from the HTML
    //can only parse the DOM from content script
    //so this script will return falsy
    if (whereIs > -1 ){
        version = namePt2.substr(whereIs +1)
        namePt2 = namePt2.substr(0, whereIs)
        name = namePt1 + "/" + namePt2
        name = encodeURIComponent(name);
        version = encodeURIComponent(version);
        artifact = {
            format: format, 
            datasource: datasource,
            name: name, 
            version: version
        }  
    } else{
      //return falsy
      artifact = ""
    }
    return artifact;
}

function parseCocoaPodsURL(url) {
    console.log('parseCocoaPodsURL');
    let format = formats.cocoapods;
    let datasource = dataSources.OSSINDEX;

    // var elements = url.split('/')
    //https://cocoapods.org/pods/TestFairy
    //no version number in the URL
    return false;
  }

function parseCRANURL(url) {
    //https://cran.r-project.org/
    // https://cran.r-project.org/web/packages/latte/index.html
    //https://cran.r-project.org/package=clustcurv
    //no version ATM
    let format = formats.cocoapods;
    let datasource = dataSources.OSSINDEX;

    return false;
}

function parseGoLangURL(url) {
    //https://gocenter.jfrog.com/github.com~2Fhansrodtang~2Frandomcolor/versions
    let format = formats.cocoapods;
    let datasource = dataSources.OSSINDEX;

    return false;
}

function BuildSettings(baseURL, username, password, appId, appInternalId){
    //let settings = {};
    console.log("BuildSettings");
    let tok = username + ':' + password;
    let hash = btoa(tok);
    let auth =  "Basic " + hash;
    let restEndPoint = "api/v2/components/details"
    if (baseURL.substring(baseURL.length-1) !== '/'){
        baseURL =baseURL + '/'
    }
    let url = baseURL + restEndPoint
    //login end point
    let loginEndPoint = "rest/user/session"
    let loginurl = baseURL + loginEndPoint
  
    //whenDone(settings);
    let settings = {
        username : username,
        password : password,
        tok : tok,
        hash : hash,
        auth : auth,
        restEndPoint : restEndPoint,
        baseURL : baseURL,
        url : url,
        loginEndPoint: loginEndPoint,
        loginurl: loginurl,
        appId: appId,
        appInternalId: appInternalId
    }
    return settings;        
}; 

function parseCratesURL( url) {
    //server is crates, language is rust
    //https://crates.io/crates/rand
    //no version in the URL    
    let format = formats.cargo;
    let datasource = dataSources.OSSINDEX;

    return false;
  }


if (typeof module !== "undefined"){
    module.exports = {
        BuildEmptySettings: BuildEmptySettings, 
        checkPageIsHandled: checkPageIsHandled,
        removeCookies: removeCookies,
        NexusFormatMaven: NexusFormatMaven,
        NexusFormatNPM: NexusFormatNPM,
        NexusFormatNuget: NexusFormatNuget,
        NexusFormatPyPI: NexusFormatPyPI,
        NexusFormatRuby: NexusFormatRuby,
        epochToJsDate: epochToJsDate,
        jsDateToEpoch: jsDateToEpoch,
        encodeComponentIdentifier: encodeComponentIdentifier,
        parseMavenURL: parseMavenURL,
        parseNPMURL: parseNPMURL,
        parseNugetURL: parseNugetURL,
        parsePyPIURL: parsePyPIURL,
        parseRubyURL: parseRubyURL,
        parsePackagistURL: parsePackagistURL,
        parseCocoaPodsURL: parseCocoaPodsURL,
        parseCRANURL: parseCRANURL,
        parseGoLangURL: parseGoLangURL,
        parseCratesURL: parseCratesURL,
        ParsePageURL: ParsePageURL
        
    };
}