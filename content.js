console.log('content.js');
ParsePage();
// $( document ).ready(function() {
//   console.log( "ready!" );
// });
// var loadfunction = window.onload;
// var parsed = false;
// if (window.jQuery) {
//   alert('yeh');
// }else{
//   alert('neh');    
// }
// window.onload = function(event){
//     //enter here the action you want to do once loaded
//     // if (window.jQuery) {
//     //   alert('yeh');
//     // }else{
//     //   alert('neh');    
//     // }
//     ParsePage();
//     if(loadfunction) loadfunction(event);
// }
// if(document.readyState === 'complete' && !parsed) {
//   // good to go!
//   ParsePage();
// }
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     console.log("content.js - chrome.runtime.onMessage.addListener");
//     console.log(request);
//     if (request.messageType === "tab_Updated" || request.messageType === "popup") {
//         console.log("success");
//         Evaluate();
//     } else {
//         //alert(request.data);
//     }
// });

// chrome.runtime.onMessage.addListener(
// function(request, sender, sendResponse) {
//     var message = ParsePage();
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     if (request.messageType == "popup"){
//       sendResponse(message);
//     };
// });


function ParsePage(){
  // if (window.jQuery) {
  //   alert('yeh');
  // }else{
  //   alert('neh');    
  // }

  //debugger;

    console.log('ParsePage');
    //who I am what is my address?
    var package;
    let format;
    let url = location.href; //'https://www.npmjs.com/package/lodash';
    console.log('url');
    console.log(url);
    if (url.search('search.maven.org/#artifactdetails') >=0){
      format = "maven";
      package = parseMaven(format, url);
    }
    if (url.search('www.npmjs.com/package') >= 0){
      //'https://www.npmjs.com/package/lodash'};
      format = "npm";
      package = parseNPM(format, url);
    }
    if (url.search('nuget.org/packages/') >=0){
      //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
      format = "nuget";
      package =  parseNuget(format, url);
    }    
    
    if (url.search('pypi.org/project/') >=0){
      //https://pypi.org/project/Django/1.6/
      format = "pypi";
      package = parsePyPI(format, url);
    }
    
    if (url.search('rubygems.org/gems/') >=0){
      //https://rubygems.org/gems/bundler/versions/1.16.1
      format = "gem";
      package = parseRuby(format, url);
    }
    //parsed = true;
    console.log("ParsePage Complete");
    console.log(package);
    //now we write this to background as
    //we pass variables through background
    message = {messageType: "package", payload: package};
    chrome.runtime.sendMessage(message, function(response){
        //sends a message to background handler
        //what should I do with the callback?
        console.log('chrome.runtime.sendMessage');
        //console.log(response);
        console.log(message);
    });
    return message;
};


function parseNPM(format, url) {
    packageName = $("span[class^=package__name]").text();    
    //  packageName=url.substr(url.lastIndexOf('/')+1);
    packageName = encodeURIComponent(packageName);
    version = $("div[class^=package__sidebarSection]:contains('version')").text();
    version = encodeURIComponent(version);
    version = version.substr('version'.length);
    return {format:format, packageName:packageName, version:version}
  }



  
  function parseMaven(format, url) {
    //for now we have to parse the URL, I cant get the page source??
    //it's in an iframe
    //https://search.maven.org/#artifactdetails%7Ccommons-collections%7Ccommons-collections%7C3.2.1%7Cjar
    var elements = url.split('%7C')
    groupId = elements[1];
    //  packageName=url.substr(url.lastIndexOf('/')+1);
    groupId = encodeURIComponent(groupId);
    artifactId = elements[2];
    artifactId = encodeURIComponent(artifactId);
  
    version = elements[3];
    version = encodeURIComponent(version);
    
    extension = elements[4];
    extension = encodeURIComponent(extension);
  
    return {format: format, groupId:groupId, artifactId:artifactId, version:version, extension: extension}
  }
  
  function parsePyPI(format, url) {
    console.log('parsePyPI');
    //https://pypi.org/project/Django/1.6/
    //https://pypi.org/project/Django/


    var elements = url.split('/')
    if (elements[5]==""){
      //then we will try to parse
      //#content > section.banner > div > div.package-header__left > h1
      //Says Django 2.0.5
      name = elements[4];
      versionHTML = $("h1.package-header__name").text().trim();
      console.log('versionHTML');
      console.log(versionHTML);
      var elements = versionHTML.split(' ');
      version = elements[1];
      console.log(version);
    }
    else{
      name = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);    
      version = elements[5];
    }
    name = encodeURIComponent(name);
    version = encodeURIComponent(version);

    return {format: format, name:name, version:version}
  }
  
  
  
  
  function parseNuget(format, url) {
    //for now we have to parse the URL, I cant get the page source??
    //it's in an iframe
    //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
    var elements = url.split('/')
    if(elements[5]==""){
      //we are on the latest version - no version in the url
      //https://www.nuget.org/packages/LibGit2Sharp/
      packageId = elements[4];
      version = $(".package-title .text-nowrap").text();
    }
    else{
      packageId = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);
      version = elements[5];
    }
    packageId = encodeURIComponent(packageId);
    version = encodeURIComponent(version);
    return {format: format, packageId:packageId, version:version}
  }
  
  function parseRuby(format, url) {
    //for now we have to parse the URL, I cant get the page source??
    //it's in an iframe
    console.log('parseRuby');
    var elements = url.split('/')
    if (elements.length < 6){
      //current version is inside the dom
      //https://rubygems.org/gems/bundler
      name = elements[4];
      versionHTML = $("i.page__subheading").text();
      console.log('versionHTML');
      console.log(versionHTML);
      version=versionHTML.trim();
    }
    else{
      //https://rubygems.org/gems/bundler/versions/1.16.1
      name = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);
      version = elements[6];
    }
    name = encodeURIComponent(name);
    version = encodeURIComponent(version);
    return {format: format, name:name, version:version}
  }