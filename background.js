console.log('background.js');
//global var to hold the package object
window.message = null;
window.package = null;
window.gSettings = null;


chrome.runtime.onMessage.addListener(receiver);
function receiver (message, sender, sendResponse){
    //alert(message.data);
    //I hate anonymous functions
    //chain the response to the popup
    console.log('chrome.runtime.onMessage.addListener-receiver');
    console.log(message);
    if (message.messageType === 'package'){
      window.message = message;
      window.package = message.payload;
    }else if(message.messageType === 'settings'){
      window.gSettings = message.payload;
    };
    //sendResponse should be a callback
    sendResponse = message;
    // read `newIconPath` from request and read `tab.id` from sender
    // if (message.messageType === "newIcon"){
    //   var tabId = getActiveTab().tabId;
    //   chrome.pageAction.setIcon({
    //       path: message.newIconPath,
    //       tabId: tabId
    //   });
    // }
};

function TellContentToWakeUp(tab){
    //TellContentToWakeUp(tab);
    console.log('TellContentToWakeUp');
    console.log(tab);
    chrome.tabs.executeScript(tab.id, { file: "jquery.js" }, function() {
      chrome.tabs.executeScript(tab.id, { file: "content.js" });
    });    
    //return;
    // chrome.tabs.executeScript(tab.id, {
    //     "file": "content.js"
    // }, function () { // Execute your code
    //     //ParsePage();
    //     console.log("Script Executed .. "); // Notification on Completion
    // });

    //return;
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //     var tab = tabs[0];
    //     console.log(tab);
    //     // message = {
    //     //     messageType: "popup",
    //     //     payLoad: tab};
    //     console.log ('message');
    //     console.log(message);
    //     chrome.tabs.sendMessage(tab.id, message, function(response) {
    //       console.log(response);
    //     });
    //   });
}

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    //page was updated
    //need to check that it is one of ours
    if (changeInfo.status == 'complete' && tab.active) {  
      // do your things
        // alert('onUpdated complete');
        console.log('chrome.tabs.onUpdated.addListener');
        //need to tell the content script to reevaluate
        //send a message to content.js
        //I thought that content.js always runs on an appropriate page but apparently not
        let url = tab.url;
        if (IsThisAPageICareAbout(url)){
          // alert('activate');
          //need to check that it is one of ours
          TellContentToWakeUp(tab);
        }    
    }
  });

// chrome.runtime.onInstalled.addListener(function() {
//     console.log('chrome.runtime.onInstalled.addListener');
//     chrome.tabs.query({active: true, currentWindow:true}, function(tabs){
//         var tab = tabs[0];
        
//         console.log('tab');
//         console.log(tab);
        
//         if (tabs.count > 0 && changeInfo.status == 'complete' && tab.active) {
//             // do your things
//               console.log('chrome.tabs.onUpdated.addListener');
//               //need to tell the content script to reevaluate
//               //send a message to content.js
//               TellContentToWakeUp(tab);
//             }      
//     });
//   });
  

chrome.tabs.onActivated.addListener(function(tab) {
    console.log('chrome.tabs.onActivated.addListener');
    console.log(tab);
    let url = tab.url;
    if (IsThisAPageICareAbout(url)){
      // alert('activate');
      //need to check that it is one of ours
      TellContentToWakeUp(tab);
    }
});
    
    
// //this does not fire as I am using a popup.html file so I need another way to fire the event
// chrome.browserAction.onClicked.addListener(function (tab) { //Fired when User Clicks ICON
//     console.log('chrome.browserAction.onClicked.addListener');
//     TellContentToWakeUp(tab);
// });


chrome.runtime.onInstalled.addListener(function() {
    loadSettings(); //this should populate the window message for the options

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          //https://search.maven.org/#artifactdetails%7Corg.apache.struts%7Cstruts2-core%7C2.3.31%7Cjar
          //bug in Chrome extensions dont handle hashes https://bugs.chromium.org/p/chromium/issues/detail?id=84024
          pageUrl: {hostEquals: 'search.maven.org', 
                    schemes: ['https']},
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
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  });

function getActiveTab(){
  var tab;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var tab = tabs[0];
    console.log(tab);
    message = {
        messageType: "popup",
        payLoad: tab
      };
    console.log ('message');
    console.log(message);
    chrome.tabs.sendMessage(tab.id, message, function(response) {
      console.log(response);
    });
  });
  return (tab);
}

function loadSettings(){
  console.log('loadSettings');

  chrome.storage.sync.get(['url', 'username', 'password'], function(data){
      console.log("url: "+ data.url);
      console.log("username: "+ data.username);
      console.log("password: "+ data.password);
      let username = data.username;
      let password = data.password;
      let baseURL = data.url;
      let settings;
      if (!username){
        settings = DefaultSettings();
      }else{
        settings = BuildSettings(baseURL, username, password);
      }
      console.log("settings:");
      console.log(settings);  
           
      return settings;
  });
  
};

function DefaultSettings(){
  console.log("DefaultSettings:");
  var username = "admin"
  var password = "admin123";
  var url = "http://localhost:8011/"    

    //alert(value);
  chrome.storage.sync.set({'url':url}, function(){
      //alert('saved'+ value);
      chrome.storage.sync.set({'username':username}, function(){
        //alert('saved'+ value);
        chrome.storage.sync.set({'password':password}, function(){
          //alert('saved'+ value);
        });
      });    
  });
  let settings = BuildSettings(baseURL, username, password);
  return settings;
};

function BuildSettings(baseURL, username, password) {
  //let settings = {};
  console.log("BuildSettings");
  let tok = username + ':' + password;
  let hash = btoa(tok);
  let auth =  "Basic " + hash;
  let restEndPoint = "api/v2/components/details"
  let url = baseURL + restEndPoint

  //whenDone(settings);
  let settings = {
      username : username,
      password : password,
      tok : tok,
      hash : hash,
      auth : auth,
      restEndPoint : restEndPoint,
      baseURL : baseURL,
      url : url 
  }
  window.gSettings = settings;   
  return settings;        
};  

function IsThisAPageICareAbout(url){
  /// <summary>Determines if we are analysing this page or not.</summary>  
  /// <param name="url" type="string">The url to check.</param>  
  /// <returns type="Boolean">Yes we do care, No we don't.</returns>  
  let retVal = false;
  let format = "";
  if (url.search('search.maven.org/#artifactdetails') >=0){
    format = "maven";
    retVal = true;
    return retVal;
  }

  if (url.search('www.npmjs.com/package') >= 0){
    //'https://www.npmjs.com/package/lodash'};
    format = "npm";
    retVal = true;
    return retVal;
  }
  if (url.search('nuget.org/packages/') >=0){
    //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
    format = "nuget";
    retVal = true;
    return retVal;
  }    
  
  if (url.search('pypi.org/project/') >=0){
    //https://pypi.org/project/Django/1.6/
    format = "pypi";
    retVal = true;
    return retVal;
  }
  
  if (url.search('rubygems.org/gems/') >=0){
    //https://rubygems.org/gems/bundler/versions/1.16.1
    format = "gem";
    retVal = true;
    return retVal;
  }
  return retval;
}