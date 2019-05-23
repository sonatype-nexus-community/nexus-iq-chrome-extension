console.log('background.js');
if (typeof chrome !== "undefined"){
    chrome.runtime.onMessage.addListener(gotMessage);
}
window.serverBaseURL = ""
window.username = ""
window.password = ""
window.haveLoggedIn = false
window.message = ""
 
function install_notice() {
    if (localStorage.getItem('install_time'))
        return;

    var now = new Date().getTime();
    localStorage.setItem('install_time', now);
    chrome.tabs.create({url: "options.html"});
}
install_notice();

// getActiveTab();

function gotMessage(message, sender, sendResponse){
    
    console.log('gotMessage', message);
    var settings;
    var retval;
    var baseURL, username, password;
    var artifact;
    // console.log('message')
    // console.log(message)
    switch (message.messagetype){
        case messageTypes.login:
            //login attempt
            baseURL = message.baseURL;
            username = message.username;
            password = message.password;
            settings = BuildSettings(baseURL, username, password)
            window.baseURL = baseURL;//"http://localhost:8070/"
            window.username = username; //"admin"
            window.password = password;//"admin123"
            retval = login(settings);
            break;
        case messageTypes.evaluate:
            //evaluate
            artifact = message.artifact;
            // window.baseURL = "http://iq-server:8070/"
            // window.username = "admin"
            // window.password = "admin123"


            // baseURL = window.baseURL;//"http://localhost:8070/"
            // username = window.username; //"admin"
            // password = window.password;//"admin123"
            // settings = BuildSettings(baseURL, username, password)
            // window.baseURL = baseURL;//"http://localhost:8070/"
            // window.username = username; //"admin"
            // window.password = password;//"admin123"
            // retval = evaluate(artifact, settings);
            // retval = evaluate2(artifact, settings);
            retval = loadSettingsAndEvaluate(artifact);
            break;
        case messageTypes.displayMessage:            
            //display message
            //this needs to be ignored in the background.js
            //because it is for the popup only to display
            console.log('background display message message');
            break;
        case messageTypes.artifact:            
            //display message
            //this needs to be ignored in the background.js
            //because it is for the popup only to display
            console.log('background artifact message does not need to respond');
            break;
        default:
            console.log('unhandled message.messagetype');
            console.log(message);
            // alert('unhandled case');

    }
    sendResponse({complete: true});
    
}

function loadSettingsAndEvaluate(artifact){
    console.log('loadSettingsAndEvaluate', artifact);
  
    chrome.storage.sync.get(['url', 'username', 'password', 'appId'], function(data){
        console.log("data: ", data);
        let username = data.username;
        let password = data.password;
        let baseURL = data.url;
        let appId = data.appId;
        let settings;
        if (!username){
            // settings = BuildEmptySettings();
            
            let errorMessage = {
                messagetype: messageTypes.loginFailedMessage,
                message: {response:"No Login Settings have been saved yet. Go to the options page."},
                artifact: artifact
            }
            console.log('sendmessage');
            console.log(errorMessage);
            chrome.runtime.sendMessage(errorMessage);
            
        }else{
            settings = BuildSettings(baseURL, username, password, appId);
            retval = evaluate(artifact, settings);
        }
        console.log("settings:");
        console.log(settings);        
        return settings;
    });    
};


function login(settings){
    console.log("login");
    console.log(settings.auth);
    var retVal;
    // var retVal = {error: false, response: 'ok'};
    // let loggedInMessage = {
    //     messageType: messageTypes.loggedIn,
    //     message: retVal
    // }
    // chrome.runtime.sendMessage(loggedInMessage);
    // return(retVal);
    // let inputstr = 'crap'
    let xhr = new XMLHttpRequest();
    xhr.open("GET", settings.loginurl, true);
    // xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.setRequestHeader("Authorization", settings.auth);
    // xhr.withCredentials = true; 
    xhr.onload = function (e) {
        let error = 0;
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log(xhr.responseText);
                // error = 0
                // response = xhr.responseText
            } else {
                console.log(xhr.statusText);
                // error = xhr.status;
                // response = xhr.statusText;
            }
            retVal = {error: xhr.status !== 200, response: xhr.responseText};
            // return
            // let retval = evaluate(artifact, settings);
            
            if (retVal.error){
                console.log('WebRequest error');
                console.log(retval);
            }else{
                console.log('happy days');
                console.log(retVal);
            }
            let loggedInMessage = {
                messagetype: messageTypes.loggedIn,
                message: retVal
            }
            window.haveLoggedIn = true;
            console.log('sendmessage');
            console.log(loggedInMessage);
            chrome.runtime.sendMessage(loggedInMessage);
            return(retVal);
        }
    };
    xhr.onerror = function (e) {
        console.log(xhr);
        retVal = {error: xhr.status, response: xhr.responseText};
        let loginFailedMessage = {
            messagetype: messageTypes.loginFailedMessage,
            message: retVal,
            
        }
        chrome.runtime.sendMessage(loginFailedMessage);
        return(retVal);
    };
    // xhr.setRequestHeader("Authorization", settings.auth);
    console.log('about to send');    
    xhr.send();
    console.log('sent');    
    console.log(xhr);
    
}


function evaluate(artifact, settings){
    console.log('evaluate');
    console.log(artifact)
    console.log(settings)

    // console.log(artifact.datasource)
    switch(artifact.datasource) {
        case dataSources.NEXUSIQ:
        removeCookies(settings.url);
        resp = callIQ(artifact, settings);
            break;
        case dataSources.OSSINDEX:
          resp = addDataOSSIndex(artifact);
          break;
        default:
          alert('Unhandled datasource' + artifact.datasource);

    }
}


function callIQ(artifact, settings){
    console.log("evaluate");
    console.log(settings.auth);
    console.log(artifact);
    var requestdata = NexusFormat(artifact);
    
 
  
    
    let inputStr = JSON.stringify(requestdata);
    var retVal
    console.log(inputStr);
    var response

    let xhr = new XMLHttpRequest();
    let url = settings.url;
    // url.replace('http//', 'http://admin@admin123')
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    // xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    // xhr.dataType = "jsonp"
    
    // xhr.setRequestHeader("IEAuth", settings.auth);
 
    //security stopped these
    // xhr.setRequestHeader("Content-length", inputStr.length); 
    // http.setRequestHeader("Connection", "close");
    xhr.setRequestHeader("Authorization", settings.auth);
    xhr.withCredentials = true; 
    xhr.onload = function (e) {
        let error = 0;
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('xhr');
                console.log(xhr);
                
                console.log(xhr.responseText);
                error = 0
                // response = xhr.responseText
                response = JSON.parse(xhr.responseText);

            } else {
                console.log(xhr);
                error = xhr.status;
                response = xhr.responseText;
                // response: "This REST API is meant for system to system integration and can't be accessed with a web browser."
                // responseText: "This REST API is meant for system to system integration and can't be accessed with a web browser."
            }
            retVal = {error: error, response: response};
            // return
            // let retval = evaluate(artifact, settings);
            console.log(retVal);
            if (retVal.error){
                console.log('we got some error');
            }else{
                console.log('happy days');
            }
            let displayMessage = {
                messagetype: messageTypes.displayMessage,
                message: retVal,
                artifact: artifact
            }
            console.log('sendmessage');
            console.log(displayMessage);
            chrome.runtime.sendMessage(displayMessage);
            return(retVal);
        }
    };
    xhr.onerror = function (e) {
        console.log(xhr);
        //let response = JSON.parse(xhr.responseText);
        let response = {errorMessage: xhr.responseText};
        retVal = {error: xhr.status, response: response};
        let displayMessage = {
            messagetype: messageTypes.displayMessage,
            message: retVal,
            artifact: artifact
        }
        chrome.runtime.sendMessage(displayMessage);
        return(retVal);
    };
    // xhr.setRequestHeader("Authorization", settings.auth);
    console.log('about to send');    
    // xhr.send(inputStr);
    xhr.send(inputStr );
    // xhr.send();
    console.log('sent');    
    console.log(xhr);
}


function BuildSettings(baseURL, username, password){
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
    }
    return settings;        
}; 


function getActiveTab(){
    console.log('getActiveTab');
    var tab;
    let params = {active: true, currentWindow: true}
    chrome.tabs.query(params, function(tabs) {
      var tab = tabs[0];
      console.log(tab);
      ToggleIcon(tab);

    //   let message = {
    //       messageType: "popup",
    //       payLoad: tab
    //     };
    //   console.log ('message');
    //   console.log(message);
    //   chrome.tabs.sendMessage(tab.id, message, function(response) {
    //     console.log(response);
    //   });
    });
    return (tab);
};
  


function ToggleIcon(tab){
    console.log('ToggleIcon', tab);
    let found = checkPageIsHandled(tab.url)

    if (found){
        chrome.pageAction.show(tab.id);        
    }else{
        chrome.pageAction.hide(tab.id);
    }
    console.log(found);
}

function addDataOSSIndex( artifact){// pass your data in method
    //OSSINdex is anonymous
    console.log('entering addDataOSSIndex', artifact);
    let retVal;
    // https://ossindex.sonatype.org/api/v3/component-report/composer%3Adrupal%2Fdrupal%405
    //type:namespace/name@version?qualifiers#subpath 
    let format = artifact.format;
    let name = artifact.name;
    let version = artifact.version;
    let OSSIndexURL 
    if(artifact.format == formats.golang){
        //Example: pkg:github/etcd-io/etcd@3.3.1
        OSSIndexURL = "https://ossindex.sonatype.org/api/v3/component-report/" + artifact.type + '%3A' + artifact.namespace + '%3A'+ artifact.name + '%40' + artifact.version
    }else{
        // OSSIndexURL= "https://ossindex.sonatype.org/api/v3/component-report/" + format + '%3A'+ name + '%40' + version
        //https://ossindex.sonatype.org/api/v3/component-report/pkg:github/jquery/jquery@3.0.0
        OSSIndexURL= `https://ossindex.sonatype.org/api/v3/component-report/pkg:${artifact.format}/${artifact.name}@${artifact.version}`
    }
    let status = false;
    //components[""0""].componentIdentifier.coordinates.packageId
    // console.log('settings');
    // console.log(settings);
    // console.log(settings.auth);
    // console.log("inputdata");
    console.log('artifact request', artifact);
    console.log("OSSIndexURL request", OSSIndexURL);
    inputStr=JSON.stringify(artifact);

        
    // if (!settings.baseURL){
    //     retVal = {error: 1001, response: "Problem retrieving URL"};
    //     console.log('no base url');
    //     return (retVal);
    // }
    let displayMessage;

    $.ajax({            
        type: "GET",
        // beforeSend: function (request)
        // {
        //     //request.withCredentials = true;
        //     // request.setRequestHeader("Authorization", settings.auth);
        // },            
        async: true,
        url: OSSIndexURL,
        data: inputStr,
        
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        crossDomain: true,
        success: function (responseData, status, jqXHR) {
            console.log('ajax success');
            console.log(responseData);
            status = true;
            retVal = {error: 0, response: responseData}; //no error
            //return (retVal);
            //handleResponseData(responseData);
            //alert("success");// write success in " "
            displayMessage = {                
                messagetype: messageTypes.displayMessage,
                artifact: artifact,            
                message: retVal                
            }
            console.log('sendmessage displayMessage', displayMessage);
            chrome.runtime.sendMessage(displayMessage);
            return(retVal);
        },

        error: function (jqXHR, status) {
            // error handler
            console.log('$.ajax get error');
            console.log(jqXHR);
            //console.log(jqXHR.responseText  + jqXHR.responseText + jqXHR.status);
            //alert('fail' + jqXHR.responseText  + '\r\n' + jqXHR.statusText + '\r\n' + 'Code:' +  jqXHR.status);
            let error = jqXHR.status;
            let timeout = (jqXHR.statusText === 'timeout' && error === 0);
            if (timeout){
                error =  true;
            }
            retVal={error: error, response: jqXHR};
            displayMessage = {                
                messagetype: messageTypes.displayMessage,
                artifact: artifact,            
                message: retVal                
            }
            chrome.runtime.sendMessage(displayMessage);
            return (retVal);
        },
        timeout: 3000 // sets timeout to 3 seconds
    });
};


chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    //page was updated
    console.log('chrome.tabs.onUpdated.addListener', tabId, changeInfo, tab)
    chrome.pageAction.hide(tabId);
    if (changeInfo.status == 'complete' && tab.active && changeInfo.url) {  
      // do your things
        console.log('chrome.tabs.onUpdated.addListener');
        //need to tell the content script to reevaluate
        //send a message to content.js
        ToggleIcon(tab);
    }
});
 

// var p = new Promise(function (resolve, reject) {
//     var permission = true;
//     chrome.storage.sync.get({
//         history: true
//     }, function (items) {
//         permission = items.history;
//         resolve(permission);
//     });
// });
// p.then(function (permission) {
//     loadStuff(permission);
// });

async function quickTest(){
    let artifact = {
        format :"maven",        
          artifactId :"springfox-swagger-ui",
          classifier :"",
          extension :"jar",
          groupId:"io.springfox",
          version:"2.6.1"
        
      }
    let nexusArtifact = NexusFormatMaven(artifact)
    nexusArtifact.hash = "4c854c86c91ab36c86fc"
    let settings = BuildSettings("http://iq-server:8070/", "admin", "admin123")
    let cve = 'CVE-2018-3721'
    let myResp3 = await GetCVEDetails(cve, nexusArtifact, settings)
    console.log('myResp3');
    console.log(myResp3);
}

async function quickTest2(){
    let artifact = {
        format :"maven",        
        groupId:"commons-collections",
        artifactId :"commons-collections",
        version:"3.2.1",
        classifier :"",
        extension :"jar"
        
      }
    let nexusArtifact = NexusFormatMaven(artifact)
    nexusArtifact.hash = "761ea405b9b37ced573d"
    let settings = BuildSettings("http://iq-server:8070/", "admin", "admin123")
    let cve = 'sonatype-2015-0002'
    let myResp3 = await GetCVEDetails(cve, nexusArtifact, settings)
    console.log('myResp3');
    console.log(myResp3);
}

chrome.tabs.onSelectionChanged.addListener(function(tabId) {
    console.log('chrome.tabs.onSelectionChanged.addListener', tabId)
    chrome.pageAction.hide(tabId);
});
/////////////////Listeners///////////////////////////////////
chrome.tabs.onActivated.addListener(function(activeInfo) {
    console.log('chrome.tabs.onActivated.addListener(function(activeInfo) tabId', activeInfo);
    let tabId = activeInfo.tabId;
    // chrome.pageAction.hide(tabId)
    // var tab = chrome.tabs.get(activeInfo.tabId, function(tab) {
    //     let url = tab.url;
    //     if (typeof url !== "undefined" && checkPageIsHandled(url)){
    //         installScripts();
    //     }    
    // });
});


chrome.runtime.onInstalled.addListener(function() {
    // loadSettings();
    // let tabId = 0;
    // if (checkPageIsHandled(url)){
    //     // browser.pageAction.hide();
    // }else{
    //     browser.pageAction.hide(tabId);
    // }
    
    
    console.log('chrome.runtime.onInstalled.addListener')
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [
          //https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
          new chrome.declarativeContent.PageStateMatcher({  
            pageUrl: {hostEquals: 'mvnrepository.com', 
                      schemes: ['https'],
                      pathContains: "artifact"
                  },
          }),      
  
            new chrome.declarativeContent.PageStateMatcher({
          //https://search.maven.org/#artifactdetails%7Corg.apache.struts%7Cstruts2-core%7C2.3.31%7Cjar
          //bug in Chrome extensions dont handle hashes https://bugs.chromium.org/p/chromium/issues/detail?id=84024

          pageUrl: {hostEquals: 'search.maven.org', 
                    schemes: ['https'],
                    pathContains: "artifact"
                },
        }),      
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'www.npmjs.com',
                    schemes: ['https'],
                    pathContains: "package"},          
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'www.nuget.org', 
                    schemes: ['https'],
                    pathContains: "packages"}, 
        }),      
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'pypi.org', 
                    schemes: ['https'],
                    pathContains: "project"}, 
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'rubygems.org', 
                    schemes: ['https'],
                    pathContains: "gems"}, 
        }),
        //OSSINDEX
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'packagist.org', 
                      schemes: ['https'],
                      pathContains: "packages"}, 
          }),
        new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'cocoapods.org', 
                    schemes: ['https'],
                    pathContains: "pods"}, 
        }),          
        new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'cran.r-project.org', 
                    schemes: ['https']}, 
        }),
        new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'crates.io', 
                    schemes: ['https'],
                    pathContains: "crates"
                }
        }),
        new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'search.gocenter.io', 
                    schemes: ['https'],
                    pathContains: "github.com"
                }
        }),
        //https://github.com/jquery/jquery/releases/tag/3.0.0
        new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'github.com', 
                    schemes: ['https'],
                    pathContains: "releases/tag"
                }
        })                                                               
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
});

function receiveText(resultsArray){
    console.log(resultsArray[0]);
};