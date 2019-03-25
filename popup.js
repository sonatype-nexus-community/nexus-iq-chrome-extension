console.log ('popup.js');

//var settings;
//var componentInfoData;
function OnLoad() {
    console.log("POPUP: OnLoad");
    var bg = getBG();
    bg.getBGMessage(function(message) {
        console.log(message);
        console.log(bg.getBGMessage2());
    });
}
$(function () {
    try{
        // Animate loader off screen

        LoadPopup();
    }
    catch (err){
        showError(err);
    }
    finally{
        hideLoader();
    }
});

function LoadPopup(){
    //setupAccordion();
    showLoader();
    $('#error').hide()
    $( "#tabs" ).tabs();

    //i should send a message to the content script in the future to parse the page
    //for now I am going to rely on the content script running and it has parsed the r.

    //need to make sure that we have the data from the wbesite
    
    //access background page global variables

    let bpage = chrome.extension.getBackgroundPage();
    console.log(bpage);
    var message = bpage.message;
    console.log ("message");
    console.log (message);
    let settings = bpage.gSettings;
    if (settings ===null){
        throw "Login Settings not set";
    }
    if (message !=null  && message.messageType === 'package' && settings != null) {
        package = message.payload;
        console.log("package");
        console.log(package);
        if (package===null){
            throw "No package set";

        } 
        //need to get server options
        // how it would be done in asynchronous code
        let format = package.format;
        requestdata = nexusFormat(package);
        
        //var settings = getSettings(addData);
        console.log("requestdata");
        console.log(requestdata);
        
        
        //let settings = loadSettings(addData(settings, requestdata, createHTML));
        
        console.log(settings);            
        //let componentInfoData = addDataFetch(settings, requestdata);
        let componentInfoData = addData(settings, requestdata);
        console.log('we got here');
        //return;
        console.log(componentInfoData);  
        hideLoader();  
        //return;
        handleSyncResponse(componentInfoData);
    } else{
        error="Message from background empty";
        console.log (error);
        $("#package").html( error );
        hideLoader();
        showError(error);
    }            
}

// function popup() {
//     //what's the purpose of this function?
//     console.log('popup');
//     var message;

//     chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
//         console.log('chrome.tabs.query');
//         var tab = tabs[0];
//         console.log(tab);
//         //message = { messageType: "popup", payLoad: tab};
//         var code = 'window.location.reload();';
//         chrome.tabs.executeScript(tab.id, {code: code});
//         //chrome.tabs.sendMessage(tab.id, message);
//         // chrome.runtime.sendMessage(message, function(response){
//         //     //sends a message to background handler
//         //     message = {messageType: "popup", payload: tab};
//         // });    
//     });
// }

function addDataFetch(settings, inputdata) {
    // pass your settings in for a connection
    //pass in the inputdata to query
    //will use fetch and promises instead of jquery ajax
    //returns json data from call
    console.log('entering addDataFetch');
    var retVal; //return object including status
    retVal = {error: 1002, response: "Unspecified error"};

    var status = false;

    console.log('settings');
    console.log(settings);
    console.log(settings.auth);
    console.log("inputdata");
    console.log(inputdata);
    inputStr=JSON.stringify(inputdata);

        
    if (!settings.baseURL){
        retVal = {error: 1001, response: "Problem retrieving URL"};
        console.log('no base url');
        throw retVal;
    }

    // Example POST method implementation:

    postData(settings.url, inputdata)
        .then(function (data){
            console.log('then');
            console.log(data);
            //data => console.log(data)) // JSON from `response.json()` call
            retVal=data;
            createHTML();
        })
        .catch(function (error){
            console.log('catch');
            //error => console.error(error)
            retVal={error: jqXHR.status, response: jqXHR};
        })

    function postData(url, data) {
        // Default options are marked with *
        console.log('postData');
        return fetch(url, {
            body: inputStr, // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: {
                'Authorization' : settings.auth,
                'user-agent': 'Mozilla/4.0 MDN Example',
                'content-type': 'application/json'
            },
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer            
            timeout: 3000
            })
        .then(response => response.json()) // parses response to JSON
    }
    console.log('here after the post');
    console.log(retVal);
    let componentInfoData = retVal;
    var componentDetail = componentInfoData.response;
    console.log("componentInfoData");
    console.log(componentDetail);
    
    //callback(componentDetail);
    return retVal;
};

function showLoader() {
    $(".loader").fadeIn("slow");
    // $("#loader").animate({
    //     top: -200
    // }, 1500);
}
function hideLoader() {
    $(".loader").fadeOut("slow");
}

function showError(error) {
    $("#error").html(error);
    $("#error").fadeIn("slow");
    $('#error').show();

}

function hideError() {
    $("#error").fadeOut("slow");
    $('#error').hide();

}



function loadSettings(callback) {
    console.log('loadSettings');

    chrome.storage.sync.get(['url', 'username', 'password'], function(data){
        //console.log("url: "+ data.url);
        //console.log("username: "+ data.username);
        //console.log("password: "+ data.password);
        let username = data.username;
        let password = data.password;
        let baseURL = data.url;
        let settings = BuildSettings(baseURL, username, password);
        //console.log("settings:");
        //console.log(settings);        
        //callback(settings);
        return settings;
    });
    function BuildSettings(baseURL, username, password){
        console.log('BuildSettings');
        //let settings = {};
        //console.log("BuildSettings");
        let tok = username + ':' + password;
        let hash = btoa(tok);
        let auth =  "Basic " + hash;
        let restEndPoint = "api/v2/components/details";
        if (baseURL.slice(-1) != '/'){
            baseURL += '/';
        }
        let url = baseURL + restEndPoint;

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
        console.log('BuildSettings finish');
        console.log(settings);
        
        return settings;        
    };    
};


function ChangeIconMessage(showVulnerable)  {
    if(showVulnerable) {
        // send message to background script
        chrome.runtime.sendMessage({ "messageType" : "newIcon", "newIconPath" : "images/IQ_Vulnerable.png" });
    }
    else{
        // send message to background script
        chrome.runtime.sendMessage({ "messageType" : "newIcon",  "newIconPath" : "images/IQ_Default.png"});    
    }
}

function setupAccordion() {
    console.log('setupAccordion');
    $('#accordion').find('.accordion-toggle').click(function(){

        //Expand or collapse this panel
        $(this).next().slideToggle('fast');
  
        //Hide the other panels
        $(".accordion-content").not($(this).next()).slideUp('fast');
  
      });
}




function nexusFormat(package) {    
    switch (package.format) {
        case "maven":
            coordinates = {
                    "groupId": package.groupId, 
                    "artifactId": package.artifactId, 
                    "version" : package.version,
                    'extension': package.extension
                };
            break;        
        case "npm":
            coordinates = {
                    "packageId": package.packageName, 
                    "version" : package.version
                };
            break;        
        case "nuget":
            coordinates = {
                    "packageId": package.packageId, 
                    "version" : package.version
                };
            break;        
        case 'pypi':
            coordinates = {
                    "name": package.name, 
                    "qualifier": 'py2.py3-none-any',
                    "version" : package.version,
                    "extension" : 'whl'
                };
            break;                    
        case "gem":
            coordinates = {
                    "name": package.name, 
                    "version" : package.version
                };
            break;        
        default:
            throw('Invalid package format');
            break;
    }
            
    componentDict = { components :[
            component = {
                hash: null, 
                componentIdentifier: 
                    {
                        format: package.format,
                        coordinates : coordinates
                    }
            }
        ]
    }
    console.log (componentDict);
    return (componentDict);
}



function createHTML(componentInfoData) {
    var thisComponent = componentInfoData.componentDetails["0"];
    renderComponentData(componentInfoData);
    renderLicenseData(componentInfoData);
    renderSecurityData(thisComponent);
};

function renderComponentData(componentInfoData) {
    console.log('createHTML');
    console.log(componentInfoData);
    var thisComponent = componentInfoData.componentDetails["0"];
    var component = thisComponent.component;
    console.log("component");
    console.log(component);
    var format = component.componentIdentifier.format;
    $("#format").html(format);
    var coordinates = component.componentIdentifier.coordinates;
    console.log(coordinates);
    switch(format){
        case "npm":
            $("#package").html(coordinates.packageId);
            break
        case "maven":
            $("#package").html(coordinates.groupId + ':'+ coordinates.artifactId);
            break;
        case "gem":
            $("#package").html(coordinates.name);
            break;
        case "pypi":
            $("#package").html(coordinates.name);
            break;
        case "nuget":
            $("#package").html(coordinates.packageId);            
            break;
        default:
            $("#package").html('Unknown format');
            break
    };
    console.log(coordinates.version);
    $("#version").html(coordinates.version);
    $("#hash").html(component.hash);
    
    //document.getElementById("matchstate").innerHTML = componentInfoData.componentDetails["0"].matchState;

    $("#catalogdate").html(componentInfoData.componentDetails["0"].catalogDate);
    $("#relativepopularity").html(componentInfoData.componentDetails["0"].relativePopularity);

}

function renderLicenseData(componentInfoData) {
    var licenseData = componentInfoData.componentDetails["0"].licenseData;
    if(licenseData.declaredLicenses.length > 0){
        if(licenseData.declaredLicenses["0"].licenseId ){
            //$("#declaredlicenses_licenseId").html(licenseData.declaredLicenses["0"].licenseId);
            //<a href="https://en.wikipedia.org/wiki/{{{licenseId}}}_License" target="_blank">https://en.wikipedia.org/wiki/{{{licenseId}}}_License</a>
            var link = "https://en.wikipedia.org/wiki/" + licenseData.declaredLicenses["0"].licenseId + "_License";
            console.log("link");
            console.log(link);
            console.log(licenseData.declaredLicenses["0"].licenseName);
            $("#declaredlicenses_licenseLink").attr("href", link);
            $("#declaredlicenses_licenseLink").html(licenseData.declaredLicenses["0"].licenseId);
            
        }
        //$("#declaredlicenses_licenseLink").html(licenseData.declaredLicenses["0"].licenseId);
        $("#declaredlicenses_licenseName").html(licenseData.declaredLicenses["0"].licenseName);
    }
    if(componentInfoData.componentDetails["0"].licenseData.observedLicenses.length > 0){
        $("#observedLicenses_licenseId").html(componentInfoData.componentDetails["0"].licenseData.observedLicenses["0"].licenseId);
        //document.getElementById("observedLicenses_licenseLink").innerHTML = componentInfoData.componentDetails["0"].licenseData.observedLicenses["0"].licenseName;
        $("#observedLicenses_licenseName").html(componentInfoData.componentDetails["0"].licenseData.observedLicenses["0"].licenseName);
    }

}



function renderSecurityData(thisComponent) {
    //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
    let securityIssues = thisComponent.securityData.securityIssues;
    let strAccordion = "";
    console.log(securityIssues.length);
    
    if(securityIssues.length > 0){
        $("#hasError").addClass("isVulnerable");
        for(i=0; i < securityIssues.length; i++){
            let securityIssue = securityIssues[i];

            //console.log(securityIssue.reference);
            //console.log(i);
            strAccordion += '<h3>' + securityIssue.reference + '</h3>';
            strAccordion += '<div>';
            strAccordion += '<p>Reference: ' + securityIssue.reference + '</p>';
            strAccordion += '<p>Severity: ' + securityIssue.severity + '</p>';
            strAccordion += '<p>Source: ' + securityIssue.source + '</p>';
            strAccordion += '<p>Threat Category: ' + securityIssue.threatCategory + '</p>';            
            //strAccordion += '<p>url:</p><a href="' + securityIssue.url + '">' + securityIssue.url + '</a>';
            strAccordion += '<p>url:<a href="' + securityIssue.url + '" target="_blank">' + securityIssue.url + '</a></p>';
            strAccordion += '</div>';            
        }
        console.log(strAccordion);
        $("#accordion").html(strAccordion);
        $('#accordion').accordion({heightStyle: 'panel'});
    }    
    //securityurl=<a href="{{{url}}}" target="_blank">url</a>    
}

function addData(settings, inputdata) {// pass your data in method
    console.log('entering addData');
    var retVal; //return object including status
    retVal = {error: 1002, response: "Unspecified error"};

    var status = false;

    console.log('settings');
    console.log(settings);
    console.log(settings.auth);
    console.log("inputdata");
    console.log(inputdata);
    inputStr=JSON.stringify(inputdata);

        
    if (!settings.baseURL){
        retVal = {error: 1001, response: "Problem retrieving URL"};
        console.log('no base url');
        return (retVal);
    }
    $.ajax({            
            type: "POST",
            beforeSend: function (request)
            {
                //request.withCredentials = true;
                request.setRequestHeader("Authorization", settings.auth);
            },            
            async: false,
            url: settings.url,
            data: inputStr,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            crossDomain: true,
            success: function (responseData, status, jqXHR) {
                console.log(responseData);
                status = true;
                retVal = {error: 0, response: responseData}; //no error
                //return (retVal);
                //handleResponseData(responseData);
                //alert("success");// write success in " "
            },

            error: function (jqXHR, status) {
                // error handler
                console.log('some error');
                console.log(jqXHR);
                //console.log(jqXHR.responseText  + jqXHR.responseText + jqXHR.status);
                //alert('fail' + jqXHR.responseText  + '\r\n' + jqXHR.statusText + '\r\n' + 'Code:' +  jqXHR.status);
                retVal={error: jqXHR.status, response: jqXHR};
                return (retVal);
            },
            timeout: 3000 // sets timeout to 3 seconds
        });
    let componentInfoData = retVal;
    var componentDetail = componentInfoData.response;
    console.log("componentInfoData");
    console.log(componentDetail);
    
    //callback(componentDetail);
    return retVal;
};


function handleSyncResponse(componentInfoData){
    console.log('begin handleSyncResponse');
    if (componentInfoData && componentInfoData.response.componentDetails !== undefined){
        //var settings
        //componentInfoData = load_Config(addData, requestdata);
        //componentInfoData =  requestdata;
        console.log("componentInfoData");
        console.log(componentInfoData);
        //console.log(componentInfoData.componentDetails["0"]);            
        let componentDetail = componentInfoData.response;
        let hasSecurity = (componentDetail.componentDetails["0"].securityData.securityIssues.length > 0);
        console.log("hasSecurity");
        console.log(hasSecurity);
        //let hasSecurity = false;
        //ChangeIconMessage(hasSecurity);
        //$("#package").html( componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.packageId);
        createHTML(componentDetail);
    }
    else
    {
        error = "Some error: componentInfoData is empty from server response. Check network settings.<br/>";
        error += componentInfoData.response.statusText;                
        showError(error);
    }
    hideLoader();
};