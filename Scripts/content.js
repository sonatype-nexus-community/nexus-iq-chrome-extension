console.log('content.js');
Evaluate();

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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        if (request.messageType == "popup")
        sendResponse({farewell: "goodbye"});
    });


function Evaluate(){
    console.log('Evaluate');
    //who I am what is my address?
    var package;
    let url = location.href; //'https://www.npmjs.com/package/lodash';
    console.log(url);
    if (url.search('www.npmjs.com/package') >= 0){
        //'https://www.npmjs.com/package/lodash'};
        format = "npm";
        package = parseNPM(format);

        console.log(package);
        //now we write this to background as
        //we pass variables through background
        message = {messageType: "package", payload: package};
        chrome.runtime.sendMessage(message, function(response){
            //sends a message to background handler
        });

    }
};


function parseNPM(format) {
    packageName = $("span[class^=package__name]").text();    
    //  packageName=url.substr(url.lastIndexOf('/')+1);
    packageName = encodeURIComponent(packageName);
    version = $("div[class^=package__sidebarSection]:contains('version')").text();
    version = encodeURIComponent(version);
    version = version.substr('version'.length);
    return {format:format, packageName:packageName, version:version}
  }