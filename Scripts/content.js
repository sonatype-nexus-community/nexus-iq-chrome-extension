'use strict';
console.log('contentscript.js');


// chrome.runtime.onMessage.addListener(gotMessage);
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
    var url  = window.location.href;     
    console.log('url', url);
    //this page will hear the Evaluate message as well, so ignore it
    if (message.messagetype !== messageTypes.evaluate){
      let artifact = ParsePage()
      // console.log('requestmessage', requestmessage);
      //{messageType: "artifact", payload: artifact};
      // let artifact = requestmessage.payload;
      console.log('artifact', artifact);
      let format = artifact.format;
      let evaluatemessage = {
          artifact: artifact,        
          messagetype: messageTypes.evaluate
      }
      console.log('chrome.runtime.sendMessage(evaluatemessage)', evaluatemessage);      
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
    // let datasource = dataSources.NEXUSIQ;
    let url = location.href;
    console.log('url', url);

    if (url.search('search.maven.org/artifact/') >=0){
      format = formats.maven;
      // datasource = dataSources.NEXUSIQ;
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
      artifact = parseNPM(format, url);
    }
    if (url.search('nuget.org/packages/') >=0){
      //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
      format = formats.nuget;     
      artifact =  parseNuget(format, url);

    }        
    if (url.search('pypi.org/project/') >=0){
      //https://pypi.org/project/Django/1.6/
      format = formats.pypi;      
      artifact = parsePyPI(format, url);
    }
    
    if (url.search('rubygems.org/gems/') >=0){
      //https://rubygems.org/gems/bundler/versions/1.16.1
      format = formats.gem;      
      artifact = parseRuby(format, url);
    }
    
    //OSSIndex
    if (url.search('packagist.org/packages/') >=0){
      //https: packagist ???
      format = formats.composer;
      artifact = parsePackagist(format, url);

    }
    if (url.search('cocoapods.org/pods/') >=0){
      //https:// cocoapods ???
      format = formats.cocoapods;
      artifact = parseCocoaPods(format, url);

    }
    if (url.search('cran.r-project.org/') >=0){      
      format = formats.cran;
      artifact = parseCRAN(format, url);
    }
    
    if (url.search('https://crates.io/crates/') >=0){      
      format = formats.cargo;
      artifact = parseCrates(format, url);
    }
    if (url.search('https://search.gocenter.io/') >=0){      
      format = formats.golang;
      artifact = parseGoLang(format, url);
    }
    //nexusRepo ->http://nexus:8081/#browse/browse:maven-central:commons-collections%2Fcommons-collections%2F3.2.1
    if (url.search('/#browse/browse:') >=0){      
      //format = formats.golang;
      
      artifact = parseNexusRepo(url);
    }
    console.log("ParsePage Complete");
    console.log(artifact);
    //now we write this to background as
    //we pass variables through background
    message = {
      messagetype: messageTypes.artifact,       
      payload: artifact
    };
    // chrome.runtime.sendMessage(message, function(response){
    //     //sends a message to background handler
    //     //what should I do with the callback?
    //     console.log('chrome.runtime.sendMessage', response, message);
    // });
    return artifact;
};



  
function parseMaven(format, url) {
  console.log('parseMaven')
    //old format below
    //for now we have to parse the URL, I cant get the page source??
    //it's in an iframe
    //https://search.maven.org/#artifactdetails%7Ccommons-collections%7Ccommons-collections%7C3.2.1%7Cjar
    //new format here
    
    //maven repo https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
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
    let datasource = dataSources.NEXUSIQ;
    return {format: format, groupId:groupId, artifactId:artifactId, version:version, extension: extension, datasource:datasource}
};
  


function parseNPM(format, url) {
  //ADD SIMPLE CODE THAT CHECLS THE URL?
  //note that this changed as of 19/03/19
  //version in URL
  //https://www.npmjs.com/package/lodash/v/4.17.9
  //No version in URL so read DOM
  //https://www.npmjs.com/package/lodash/
  let doc = $('html')[0].outerHTML
  // let docelements = $(doc);

  let found
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
  let datasource = dataSources.NEXUSIQ;
  return {format:format, packageName:packageName, version:version, datasource:datasource}
};

function parseNuget(format, url) {
    console.log('parseNuget:', format, url);
    //we can parse the URL or the DOM
    //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
    let elements = url.split('/')
    console.log('elements', elements)
    let packageId
    let version
    let datasource
    if(elements.length <= 5 || (elements.length === 6 && elements[5] === "")) {
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
      let titleElements = document.title.split(' ')
      packageId = titleElements[3];
      //#skippedToContent > section > div > article > div.package-title > h1 > small
      version = titleElements[4];
    }
    else{
      packageId = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);
      version = elements[5];
    }
    packageId = encodeURIComponent(packageId);
    version = encodeURIComponent(version);
    datasource = dataSources.NEXUSIQ;
    return {format: format, packageId:packageId, version:version, datasource:datasource}
};


function parsePyPI(format, url) {
    console.log('parsePyPI', format, url);
    let version, name, datasource, extension, qualifier
    //https://pypi.org/project/Django/1.6/
    //https://pypi.org/project/Django/
    let elements = url.split('/')
    if (elements[5]==''){
      //empty in element 5 means no version in the url
      //then we will try to parse
      //#content > section.banner > div > div.package-header__left > h1
      //Says Django 2.0.5
      name = elements[4];
      let versionHTML = $("h1.package-header__name").text().trim();
      console.log('versionHTML', versionHTML);
      let versionElements = versionHTML.split(' ');
      version = versionElements[1];
      console.log('version', version);
      //will try and get qualifier and extension
      //#files > table > tbody > tr:nth-child(1) > td:nth-child(1) > a:nth-child(1)
    }
    else{
      name = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);    
      version = elements[5]; 
    }
    let qualifierHTML = $("#files > table > tbody > tr:nth-child(1) > td:nth-child(1) > a:nth-child(1)").text().trim();
    //"numpy-1.16.4-cp27-cp27m-macosx_10_6_intel.macosx_10_9_intel.macosx_10_9_x86_64.macosx_10_10_intel.macosx_10_10_x86_64.whl"
    let name_ver = `${name}-${version}-`
    qualifier = qualifierHTML.substr(name_ver.length, qualifierHTML.lastIndexOf('.') - name_ver.length);
    extension = qualifierHTML.substr(qualifierHTML.lastIndexOf('.') + 1);


    name = encodeURIComponent(name);
    version = encodeURIComponent(version);
    datasource = dataSources.NEXUSIQ;
    let artifact = {
      format: format, 
      name: name, 
      version: version, 
      datasource: datasource,
      extension: extension,
      qualifier: qualifier
    }
    return artifact;    
};  

function parseRuby(format, url) {
    //for now we have to parse the URL, I cant get the page source??
    //it's in an iframe
    console.log('parseRuby');
    let elements = url.split('/')
    let name
    let versionHTML
    let version
    let datasource
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
    datasource = dataSources.NEXUSIQ;
    return {format: format, name:name, version:version, datasource:datasource}
};


///OSSIndex////
function parsePackagist(format, url) {
  //server is packagist, format is composer
  console.log('parsePackagist:' +  url);
  let name
  let version
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
    let versionHTML = $("span.version-number").first().text()
    console.log('versionHTML');
    console.log(versionHTML);
    version=versionHTML.trim();
  }
  // name = encodeURIComponent(name);
  // version = encodeURIComponent(version);
  let datasource = dataSources.OSSINDEX;
  return {
    format: format, 
    datasource: datasource,
    name: name, 
    version: version
  }
}

function parseCocoaPods(format, url) {
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
  let datasource = dataSources.OSSINDEX;
  return {
    format: format, 
    datasource: datasource,
    name: name, 
    version: version
  }
}


function parseCRAN(format, url) {
  //https://ossindex.sonatype.org/api/v3/component-report/cran%3AA3%400.0.1
  //server is CRAN, format is CRAN
  //https://cran.r-project.org/
  // https://cran.r-project.org/web/packages/latte/index.html
  //https://cran.r-project.org/package=clustcurv

  console.log('parseCRAN:', format, url);
  let elements = url.split('/')
  //CRAN may have the packagename in the URL
  //but not the version in URL
  //could also be just in the body
  let name
  let version
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
 
  let versionHTML = $('table tr:nth-child(1) td:nth-child(2)').first().text()
  console.log('versionHTML');
  console.log(versionHTML);
  version=versionHTML.trim();
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  let datasource = dataSources.OSSINDEX;
  return {
    format: format, 
    datasource: datasource,
    name: name, 
    version: version
  }
}


function parseGoLang(format, url) {
  //server is non-defined, language is go/golang
  //index of github stored at jfrog
  //https://gocenter.jfrog.com/github.com~2Fhansrodtang~2Frandomcolor/versions
  /////////Todo get this working better
  //https://search.gocenter.io/github.com~2Fetcd-io~2Fetcd/versions
  //becomes
  //https://ossindex.sonatype.org/component/pkg:golang/github.com/etcd-io:etcd@v3.3.13

  // pkg:golang/github.com/etcd-io/etcd@3.3.1
  // pkg:github/etcd-io/etcd@3.3.1
  console.log('parseGolang:', format,  url);
  let elements = url.split('/')
  //CRAN may have the packagename in the URL
  //but not the version in URL
  //could also be just in the body
  let name
  let namespace
  let type
  if (url.search('search.gocenter.io')>=0){
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
 
  let versionHTML = $("span.version-name").first().text()
  console.log('versionHTML');
  console.log(versionHTML);
  let version=versionHTML.trim();
  // name = encodeURIComponent(name);
  // version = encodeURIComponent(version);
  let datasource = dataSources.OSSINDEX;
  return {
    format: format, 
    datasource: datasource,
    type: type,
    namespace: namespace,
    name: name, 
    version: version
  }
}

function parseCrates(format, url) {
  //server is crates, language is rust
  //https://crates.io/crates/rand

  console.log('parseCrates:' +  url);
  let elements = url.split('/')
  //CRAN may have the packagename in the URL
  //but not the version in URL
  //could also be just in the body
  let name = elements[4]
  let version
  if (elements.length==5){
    //has packagename in 5
    //need to parse the HTML
    //
    let versionHTML = $("div.info h2").text()
    console.log('versionHTML');
    console.log(versionHTML);
    version=versionHTML.trim();
    }else if (elements.length==6){
    //version is in the Path
    version = elements[5];
  }
 
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  let datasource = dataSources.OSSINDEX;
  return {
    format: format, 
    datasource: datasource,
    name: name, 
    version: version
  }
}

function parseNexusRepo(url) {
  //http://nexus:8081/#browse/browse:maven-central:commons-collections%2Fcommons-collections%2F3.2.1
  console.log('parseNexusRepo:',  url);
  let elements = url.split('/')
  //CRAN may have the packagename in the URL
  //but not the version in URL
  //could also be just in the body
  let name
  let namespace
  let type
  let format
  let datasource
  let artifact
  let version
  let groupId
  let artifactId
  //#nx-info-1179 > div > table > tbody > tr:nth-child(2) > td.nx-info-entry-value
  let nexusRepoformat = $("div.nx-info > table > tbody > tr:nth-child(2) > td.nx-info-entry-value").html();
  switch(nexusRepoformat){
    case nexusRepoformats.pypi:
      format = formats.pypi;
      datasource = dataSources.NEXUSIQ;
      
      name = $("div.nx-info > table > tbody > tr:nth-child(3) > td.nx-info-entry-value").html();
      version = $("div.nx-info > table > tbody > tr:nth-child(4) > td.nx-info-entry-value").html();
      artifact = {
        format: format, 
        datasource: datasource,
        name: name,    
        version: version,
        extension: 'zip', //whl or zip, how to tell
        qualifier: ''
      };
      break;
    case nexusRepoformats.maven:
      format = formats.maven;
      datasource = dataSources.NEXUSIQ;
      groupId = $("div.nx-info > table > tbody > tr:nth-child(3) > td.nx-info-entry-value").html();
      artifactId = $("div.nx-info > table > tbody > tr:nth-child(4) > td.nx-info-entry-value").html();
      version = $("div.nx-info > table > tbody > tr:nth-child(5) > td.nx-info-entry-value").html();
      artifact = {
        format: format, 
        datasource: datasource,
        groupId: groupId,
        artifactId: artifactId,    
        version: version,
        extension: 'jar'    
      };
      break;
    case nexusRepoformats.npm:
      format = formats.npm;
      datasource = dataSources.NEXUSIQ;
      name = $("div.nx-info > table > tbody > tr:nth-child(3) > td.nx-info-entry-value").html();
      version = $("div.nx-info > table > tbody > tr:nth-child(4) > td.nx-info-entry-value").html();
      artifact = {
        format: format, 
        datasource: datasource,
        packageName: name,    
        version: version    
      };
      break;
    case nexusRepoformats.nuget:
      format = formats.nuget;
      datasource = dataSources.NEXUSIQ;
      name = $("div.nx-info > table > tbody > tr:nth-child(3) > td.nx-info-entry-value").html();
      version = $("div.nx-info > table > tbody > tr:nth-child(4) > td.nx-info-entry-value").html();
      artifact = {
        format: format, 
        datasource: datasource,
        packageId: name,    
        version: version    
      };             
      break;
    case nexusRepoformats.gem:
        format = formats.gem;
        datasource = dataSources.NEXUSIQ;
        name = $("div.nx-info > table > tbody > tr:nth-child(3) > td.nx-info-entry-value").html();
        version = $("div.nx-info > table > tbody > tr:nth-child(4) > td.nx-info-entry-value").html();
        artifact = {
          format: format, 
          datasource: datasource,
          name: name,    
          version: version    
        };             
        break;
      default:
  }
  console.log('component', artifact);
  return artifact;
}