console.log('utils.js');

var formats = {
    maven: "maven",
    npm: "npm",
    nuget: "nuget",
    gem: "gem",
    pypi: "pypi",
    packagist: "packagist",
    cocoapods: "cocoapods",
    cran: "cran",
    crates: "crates",
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

function NexusFormatMaven(artifact){  
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
						"groupId": artifact.groupId, 
						"artifactId": artifact.artifactId, 
                        "version" : artifact.version,
                        'extension': artifact.extension
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



if (typeof module !== "undefined"){
    module.exports = {
        BuildEmptySettings: BuildEmptySettings, 
        checkPageIsHandled: checkPageIsHandled,
        removeCookies: removeCookies,
        NexusFormatMaven: NexusFormatMaven,
        NexusFormatNPM: NexusFormatNPM,
        NexusFormatNuget: NexusFormatNuget,
        NexusFormatPyPI: NexusFormatPyPI,
        NexusFormatRuby: NexusFormatRuby
    };
}



