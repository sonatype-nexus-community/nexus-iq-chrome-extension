console.log('contentscript.js');


chrome.runtime.onMessage.addListener(gotMessage);
var message
function gotMessage(receivedMessage, sender, sendResponse){
    console.log('gotMessage');
    console.log(receivedMessage);
    message = receivedMessage;
    processPage(message);
}

function processPage(message = {messagetype: messageTypes.beginevaluate}){
  console.log('processPage');
  console.log(message);

    //please tell what is my url and what is my content
    console.log("url");
    var url  = window.location.href;     
    console.log(url);
    //this page will hear the Evaluate message as well, so ignore it
    if (message.messagetype !== messageTypes.evaluate){
      let requestmessage = ParsePage()
      console.log('requestmessage');
      console.log(requestmessage);
      //{messageType: "artifact", payload: artifact};
      let artifact = requestmessage.payload;
      console.log('artifact');
      console.log(artifact);
      let format = artifact.format;
      let evaluatemessage = {
          artifact: artifact,        
          messagetype: messageTypes.evaluate
      }
      console.log('chrome.runtime.sendMessage(evaluatemessage)');
      console.log(evaluatemessage);
      
      chrome.runtime.sendMessage(evaluatemessage);
    }
}



function ParsePage(){
    //returns message in format like this {messageType: "artifact", payload: artifact};
    //artifact varies depending on eco-system
    console.log('ParsePage');
    //who I am what is my address?
    let artifact;
    let format;
    let datasource = dataSources.NEXUSIQ;;
    let url = location.href;
    console.log(url);

    if (url.search('search.maven.org/artifact/') >=0){
      format = formats.maven;
      datasource = dataSources.NEXUSIQ;
      artifact = parseMaven(format, url);

    }
    //https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
    if (url.search('https://mvnrepository.com/artifact/') >=0){
      format = formats.maven;
      datasource = dataSources.NEXUSIQ;
      artifact = parseMaven(format, url);

    }

    if (url.search('www.npmjs.com/package/') >= 0){
      //'https://www.npmjs.com/package/lodash'};
      format = formats.npm;
      datasource = dataSources.NEXUSIQ;
      artifact = parseNPM(format, url);
    }
    if (url.search('nuget.org/packages/') >=0){
      //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
      format = formats.nuget;
      datasource = dataSources.NEXUSIQ;
      artifact =  parseNuget(format, url);

    }    
    
    if (url.search('pypi.org/project/') >=0){
      //https://pypi.org/project/Django/1.6/
      format = formats.pypi;
      datasource = dataSources.NEXUSIQ;
      artifact = parsePyPI(format, url);

    }
    
    if (url.search('rubygems.org/gems/') >=0){
      //https://rubygems.org/gems/bundler/versions/1.16.1
      format = formats.gem;
      datasource = dataSources.NEXUSIQ;
      artifact = parseRuby(format, url);

    }
    
    //OSSIndex
    if (url.search('packagist.org/packages/') >=0){
      //https: packagist ???
      format = formats.packagist;
      datasource = dataSources.OSSINDEX;
      artifact = parsePackagist(format, url, datasource);

    }
    if (url.search('cocoapods.org/pods/') >=0){
      //https:// cocoapods ???
      format = formats.cocoapods;
      datasource = dataSources.OSSINDEX;
      artifact = parseCocoaPods(format, url, datasource);

    }
    if (url.search('cran.r-project.org/') >=0){
      
      format = formats.cran;
      datasource = dataSources.OSSINDEX;
      artifact = parseCRAN(format, url, datasource);
    }
    
    if (url.search('https://crates.io/crates/') >=0){      
      format = formats.crates;
      datasource = dataSources.OSSINDEX;
      artifact = parseCrates(format, url, datasource);
    }
    if (url.search('https://gocenter.jfrog.com/') >=0){      
      format = formats.golang;
      datasource = dataSources.OSSINDEX;
      artifact = parseGoLang(format, url, datasource);
    }

    


    artifact.datasource = datasource;
    console.log("ParsePage Complete");
    console.log(artifact);
    //now we write this to background as
    //we pass variables through background
    message = {
      messagetype: messageTypes.artifact,       
      payload: artifact
    };
    chrome.runtime.sendMessage(message, function(response){
        //sends a message to background handler
        //what should I do with the callback?
        console.log('chrome.runtime.sendMessage');
        console.log(response);
        console.log(message);
    });
    return message;
};



  
function parseMaven(format, url) {
  console.log('parseMaven')
    //old format below
    //for now we have to parse the URL, I cant get the page source??
    //it's in an iframe
    //https://search.maven.org/#artifactdetails%7Ccommons-collections%7Ccommons-collections%7C3.2.1%7Cjar
    //new format here
    
    //maven repo https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
    var elements = url.split('/')
    groupId = elements[4];
    //  packageName=url.substr(url.lastIndexOf('/')+1);
    groupId = encodeURIComponent(groupId);
    artifactId = elements[5];
    artifactId = encodeURIComponent(artifactId);
  
    version = elements[6];
    version = encodeURIComponent(version);
    
    extension = elements[7];
    if (typeof extension === "undefined"){
      //mvnrepository doesnt have it
      extension = "jar"
    }
    extension = encodeURIComponent(extension);
  
    return {format: format, groupId:groupId, artifactId:artifactId, version:version, extension: extension}
};
  


function parseNPM(format, url) {
  //ADD SIMPLE CODE THAT CHECLS THE URL?
  //note that this changed as of 19/03/19
  //version in URL
  //https://www.npmjs.com/package/lodash/v/4.17.9
  //No version in URL so read DOM
  //https://www.npmjs.com/package/lodash/
  var doc = $('html')[0].outerHTML
  var docelements = $(doc);

  var found
  let newV 
  let elements
  let packageName
  let version
  if (url.search('/v/') >0 ){
    //has version in URL
    var urlElements = url.split('/');
    packageName = urlElements[4]
    version = urlElements[6]

  }else{
    //try to parse the URL
    //Seems like node has changed their selector
    //var found = $('h1.package-name-redundant', doc);
    // found = $('h1.package-name-redundant', doc);
    found = $("h2 span")
    console.log(found);
    if (typeof found !== "undefined" && found !== ""){
      packageName = found.text().trim();        
      // let foundV = $("h2", doc);
      //https://www.npmjs.com/package/jest
      newV = $("h2").next("span")
      if (typeof newV !== "undefined" && newV !== ""){
        newV = newV.text()
        //produces "24.5.0 • "
        let findnbsp = newV.search(String.fromCharCode(160))
        if (findnbsp >=0){
          newV = newV.substring(0,findnbsp)
        }
        version = newV;
      }
      console.log("newV");
      console.log(newV);   

    }
  }
  //  
  //  packageName=url.substr(url.lastIndexOf('/')+1);
  packageName = encodeURIComponent(packageName);
  version = encodeURIComponent(version);
  
  return {format:format, packageName:packageName, version:version}
};

function parseNuget(format, url) {
    //we can parse the URL or the DOM
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
};


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
};  

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
};


///OSSIndex////
function parsePackagist(format, url, datasource) {
  //server is packagist, format is composer
  console.log('parsePackagist:' +  url);
  var elements = url.split('/')
  //https://packagist.org/packages/drupal/drupal
  //Specific version is with a hash
  //https://packagist.org/packages/drupal/drupal#8.6.2
  var namePt1 = elements[4];
  var namePt2 = elements[5];
  name = namePt1 + "/" + namePt2
  var whereIs = namePt2.search("#")
  //is the version number in the URL? if so get that, else get it from the HTML
  if (whereIs > -1 ){
    version = namePt2.substr(whereIs +1)
  } else{
    //get the version from the HTML as we are on the generic page
    //#headline > div > h1 > span
    versionHTML = $("span.version-number").first().text()
    console.log('versionHTML');
    console.log(versionHTML);
    version=versionHTML.trim();
  }
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  return {
    format: format, 
    datasource: datasource,
    name: name, 
    version: version
  }
}

function parseCocoaPods(format, url, datasource) {
  console.log('parseCocoaPods');
  var elements = url.split('/')
  //https://cocoapods.org/pods/TestFairy
  name = elements[4];
  //#headline > div > h1 > span
  versionHTML = $("H1 span").first().text()
  console.log('versionHTML');
  console.log(versionHTML);
  version=versionHTML.trim();

  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  return {
    format: format, 
    datasource: datasource,
    name: name, 
    version: version
  }
}


function parseCRAN(format, url, datasource) {
  //https://ossindex.sonatype.org/api/v3/component-report/cran%3AA3%400.0.1
  //server is CRAN, format is CRAN
  //https://cran.r-project.org/
  // https://cran.r-project.org/web/packages/latte/index.html
  //https://cran.r-project.org/package=clustcurv

  console.log('parseCRAN:' +  url);
  let elements = url.split('/')
  //CRAN may have the packagename in the URL
  //but not the version in URL
  //could also be just in the body
  let name
  if (elements.length>5){
    //has packagename in 5
    name = elements[5]
  }
  else if(elements.length>3){
    const pckg = "package="
    name = elements[3]
    if (name.search(pckg) >= 0){
      name = name.substr(pckg.length)
    }
  }
  else {
    name = $("h2").text()
    if (name.search(":") >= 0){      
      name = name.substring(0, name.search(":"))
    }
  }
 
  versionHTML = $('table tr:nth-child(1) td:nth-child(2)').first().text()
  console.log('versionHTML');
  console.log(versionHTML);
  version=versionHTML.trim();
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  return {
    format: format, 
    datasource: datasource,
    name: name, 
    version: version
  }
}


function parseGoLang(format, url, datasource) {
  //server is non-defined, language is go/golang
  //index of github stored at jfrog
  //https://gocenter.jfrog.com/github.com~2Fhansrodtang~2Frandomcolor/versions
  // pkg:golang/github.com/etcd-io/etcd@3.3.1
  // pkg:github/etcd-io/etcd@3.3.1
  console.log('parseGolang:' +  url);
  let elements = url.split('/')
  //CRAN may have the packagename in the URL
  //but not the version in URL
  //could also be just in the body
  let name
  let namespace
  let type
  if (url.search('gocenter.jfrog.com')>=0){
    //has packagename in 5
    let fullname = elements[3]
    //"github.com~2Fhansrodtang~2Frandomcolor"
    let nameElements = fullname.split('~2F')
    // 0: "github.com"
    // 1: "hansrodtang"
    // 2: "randomcolor"
    type = 'github'
    namespace = nameElements[1]
    name = nameElements[2]
  }
 
  versionHTML = $("span.version-name").text()
  console.log('versionHTML');
  console.log(versionHTML);
  version=versionHTML.trim();
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  return {
    format: format, 
    datasource: datasource,
    type: type,
    namespace: namespace,
    name: name, 
    version: version
  }
}

function parseCrates(format, url, datasource) {
  //server is crates, language is rust
  //https://crates.io/crates/rand

  console.log('parseCrates:' +  url);
  let elements = url.split('/')
  //CRAN may have the packagename in the URL
  //but not the version in URL
  //could also be just in the body
  let name
  if (elements.length==5){
    //has packagename in 5
    name = elements[4]
  }
 
  versionHTML = $("div.info h2").text()
  console.log('versionHTML');
  console.log(versionHTML);
  version=versionHTML.trim();
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  return {
    format: format, 
    datasource: datasource,
    name: name, 
    version: version
  }
}
