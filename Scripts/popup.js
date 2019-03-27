console.log ('popup.js');
if (typeof chrome !== "undefined"){
    chrome.runtime.onMessage.addListener(gotMessage);
}

// var messageType = {
//     login: "login",  //message to send that we are in the process of logging in
//     evaluate: "evaluate",  //message to send that we are evaluating
//     loggedIn:"loggedIn",    //message to send that we are in the loggedin
//     displayMessage: "displayMessage",  //message to send that we have data from REST and wish to display it
//     loginFailedMessage: "loginFailedMessage",  //message to send that login failed
//     beginevaluate: "beginevaluate",  //message to send that we are beginning the evaluation process, it's different to the evaluatew message for a readon that TODO I fgogot
//     artifact: "artifact" //passing a artifact/package identifier from content to the background to kick off the eval

// };

// const dataSource = {
//     NEXUSIQ: 'NEXUSIQ',
//     OSSINDEX: 'OSSINDEX'
//   }


// var formats = {
//     maven: "maven",
//     npm: "npm",
//     nuget: "nuget",
//     gem: "gem",
//     pypi: "pypi",
//     packagist: "packagist",
//     cocoapods: "cocoapods"
// }

//var settings;
//var componentInfoData;
$(function () {
    //whenever I open I begin an evaluation immediately
    //the icon is disabled for pages that I dont parse
    console.log( "ready!" );
    //setupAccordion();
    showLoader();
    $('#error').hide()
    $('#tabs').tabs();
  
    //begin evaluation sends a message to the background script
    //amd to the content script
    //I may be able to cheat and just get the URL, which simplifies the logic
    //if the URL is not parseable then I will have to go the content script to read the DOM
    beginEvaluation();
    // return;
    //i should send a message to the content script in the future to parse the page
    //for now I am going to rely on the content script running and it has parsed the r.

    //need to make sure that we have the data from the wbesite
    

    // let bpage = chrome.extension.getBackgroundPage();
    // console.log(bpage);
    // var message = bpage.message;
    // console.log ("message");
    // console.log (message);
    // if (message == null){       
    //     popup();
    //     console.log("message");
    //     console.log(message);
    //     console.log(bpage.message);
    
    // }
    
});


function beginEvaluation(){
    console.log('beginEvaluation');
    //need to run query across the tabs
    //to determine the top tab.
    //I need to call sendMessage from within there as it is async

    let params = {
        currentWindow:true,
        active: true
    }
    let tabs = chrome.tabs.query(params, gotTabs);
    function gotTabs(tabs){
        let message = {
            messagetype: messageTypes.beginevaluate
        }
        let thisTab = tabs[0]
        let tabId = thisTab.id
        let url = thisTab.url;
        
        if (checkPageIsHandled(url)){
            //this sends a message to the content tab
            //hopefully it will tell me what it sees
            //this fixes a bug where we did not get the right DOM because we did not know what page we were on
            chrome.tabs.sendMessage(tabId, message);
        }
        else{
            alert('This page is not currently handled by this extension.')
        }
    }
}


function readyHandler(){
    console.log("popup.js");
    console.log(document);
    let ctrluserinput =  document.querySelector("#userinput");    
    // console.log(ctrluserinput);
    
}

function changeText(ctrluserinput){
    console.log(ctrluserinput);
    console.log(ctrluserinput);
}


function gotMessage(message, sender, sendResponse){
    console.log('gotMessage')
    console.log(message)
    // const respMessage = JSON.parse(message)
    const respMessage = message
    //this is the callback handler for a message received
    console.log('popup got message');
    console.log(respMessage);
    let hasError = false;
    switch(respMessage.messagetype){
        case messageTypes.displayMessage:    
            // alert("displayMessage");
            if (respMessage.message.error){
                showError(respMessage.message.response);
            }else{
                console.log('coming in here really late.-respMessage');
                // jQuery("#response").append('<div class="messages ok">' + message.message.response + '</div>');
                console.log(respMessage);
                var componentDetails = respMessage.message.response;
                console.log(componentDetails);
                // $("#response").html(findings.toString());
                // displayFindings(message);
                let htmlCreated = createHTML(message);
            }            
            hideLoader(hasError);
            break;
        case messageTypes.loggedIn:
            
            //logged in so now we evaluate
            console.log('logged in, now evaluate');
            let evalBegan = beginEvaluation();
            hideLoader(hasError);
            break;
        case messageTypes.loginFailedMessage:
            hasError = true;
            //display error
            console.log('display error');
            console.log(message);
            let errorShown = showError(message.message.response);
            hideLoader(hasError);
            break;
        default:
            //do nothing for now    
    }
        

}


function createHTML(message)
{
    console.log('createHTML(message)');
    console.log(message);

    // console.log(componentDetails.length)
    // const thisComponent = componentDetails["0"];
    // console.log('thisComponent')
    // console.log(thisComponent)
    switch (message.artifact.datasource){
        case dataSources.NEXUSIQ:
            renderComponentData(message);
            renderLicenseData(message);
            renderSecurityData(message);
            break;
        case dataSources.OSSINDEX:
        //from OSSINdex
            console.log('OSSINDEX');            
            renderComponentDataOSSIndex(message);
            renderLicenseDataOSSIndex(message);
            renderSecurityDataOSSIndex(message);

            break;
        default:
            //not handled
            console.log('unhandled case');
            console.log(message)
    }
};


function renderComponentDataOSSIndex(message){
    console.log('renderComponentData');
    console.log(message);
    $("#format").html(message.artifact.format);
    $("#package").html(message.artifact.name);
    $("#version").html(message.artifact.version);

    $("#hash").html(message.message.response.coordinates);
    
    //document.getElementById("matchstate").innerHTML = componentInfoData.componentDetails["0"].matchState;
    // $("#matchstate").html(message.message.response.reference)
}
function renderLicenseDataOSSIndex(message){
    //not supported
    $("#declaredlicenses").html("<h3>OSSIndex does not carry license data</h3>")
}
function renderSecurityDataOSSIndex(message){
 
    let securityIssues = message.message.response.vulnerabilities;
    let strAccordion = "";
    console.log(securityIssues.length);
    
    if(securityIssues.length > 0){
        for(i=0; i < securityIssues.length; i++){
            let securityIssue = securityIssues[i];

            //console.log(securityIssue.reference);
            //console.log(i);
            strAccordion += '<h3>' + securityIssue + '</h3>';
            strAccordion += '<div>';
            strAccordion += '<p>TO BE ADVISED</p>';
            strAccordion += '</div>';            
        }
        console.log(strAccordion);
        $("#accordion").html(strAccordion);
        //$('#accordion').accordion({heightStyle: 'content'});
        $('#accordion').accordion({heightStyle: 'panel'});
        // var autoHeight = $( "#accordion" ).accordion( "option", "autoHeight" );
        // $( "#accordion" ).accordion( "option", "autoHeight", false );
        // $("#accordion").accordion();
    }else{
        strAccordion += '<h3>No Security Issues Found</h3>';
        $("#accordion").html(strAccordion);
        //$('#accordion').accordion({heightStyle: 'content'});
        $('#accordion').accordion({heightStyle: 'panel'});

    }  

}


function renderComponentData(message){
    console.log('renderComponentData');
    console.log(message);
    var thisComponent = message.message.response.componentDetails["0"];
    let component = thisComponent.component;
    console.log("component");
    console.log(component);
    let format = component.componentIdentifier.format;
    $("#format").html(format);
    let coordinates = component.componentIdentifier.coordinates;
    console.log(coordinates);
    switch(format){
        case formats.npm:
            $("#package").html(coordinates.packageId);
            break
        case formats.maven:
            $("#package").html(coordinates.groupId + ':'+ coordinates.artifactId);
            break;
        case formats.gem:
            $("#package").html(coordinates.name);
            break;
        case formats.pypi:
            $("#package").html(coordinates.name);
            break;
        case formats.nuget:
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
    $("#matchstate").html(thisComponent.matchState)
    $("#catalogdate").html(thisComponent.catalogDate);
    $("#relativepopularity").html(thisComponent.relativePopularity);

}

function renderLicenseData(message){
    var thisComponent = message.message.response.componentDetails["0"];
    let licenseData = thisComponent.licenseData;
    if(licenseData.declaredLicenses.length > 0){
        if(licenseData.declaredLicenses["0"].licenseId ){
            //$("#declaredlicenses_licenseId").html(licenseData.declaredLicenses["0"].licenseId);
            //<a href="https://en.wikipedia.org/wiki/{{{licenseId}}}_License" target="_blank">https://en.wikipedia.org/wiki/{{{licenseId}}}_License</a>
            let link = "https://en.wikipedia.org/wiki/" + licenseData.declaredLicenses["0"].licenseId + "_License";
            console.log("link");
            console.log(link);
            console.log(licenseData.declaredLicenses["0"].licenseName);
            $("#declaredlicenses_licenseLink").attr("href", link);
            $("#declaredlicenses_licenseLink").html(licenseData.declaredLicenses["0"].licenseId);
            
        }
        //$("#declaredlicenses_licenseLink").html(licenseData.declaredLicenses["0"].licenseId);
        $("#declaredlicenses_licenseName").html(licenseData.declaredLicenses["0"].licenseName);
    }
    if(thisComponent.licenseData.observedLicenses.length > 0){
        $("#observedLicenses_licenseId").html(thisComponent.licenseData.observedLicenses["0"].licenseId);
        //document.getElementById("observedLicenses_licenseLink").innerHTML = componentInfoData.componentDetails["0"].licenseData.observedLicenses["0"].licenseName;
        $("#observedLicenses_licenseName").html(thisComponent.licenseData.observedLicenses["0"].licenseName);
    }

}

function renderSecurityData(message){
    var thisComponent = message.message.response.componentDetails["0"];
 
    //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
    let securityIssues = thisComponent.securityData.securityIssues;
    let strAccordion = "";
    console.log(securityIssues.length);
    securityIssues.sort((securityIssues1, securityIssues2)=>{
        // console.log(securityIssues1.severity);
        return  securityIssues2.severity - securityIssues1.severity;
    });
    if(securityIssues.length > 0){
        console.log(securityIssues);

        // const resultsByObjectId = sortByProperty(securityIssues, 'severity');

        // console.log(resultsByObjectId);
        // for (_index, securityIssue in securityIssues){
            // console.log(securityIssue);
        for(i=0; i < securityIssues.length; i++){
            let securityIssue = securityIssues[i];
            console.log(securityIssue);

            //console.log(securityIssue.reference);
            //console.log(i);
            let className;
            switch (true){
                case (securityIssue.severity >= 10):
                    className = "criticalSeverity" 
                    break;
                case (securityIssue.severity >= 7):
                    className = "highSeverity" 
                    break;
                case (securityIssue.severity >= 5):
                    className = "mediumSeverity" 
                    break;
                case (securityIssue.severity >= 0):
                    className = "lowSeverity" 
                    break;
                default:
                    break;
            }
            strAccordion += '<h3><span class="headingreference">' + securityIssue.reference + '</span><span class="headingseverity ' + className +'">CVSS:' + securityIssue.severity + '</span></h3>';
            strAccordion += '<div>';
            strAccordion += '<table>'
            strAccordion += '<tr>'
            strAccordion += '<td class="label">Reference:</td><td class="data">' + securityIssue.reference + '</td>';
            strAccordion += '</tr><tr>'
            strAccordion += '<td class="label">Severity:</td><td class="data">' + securityIssue.severity + '</td>';
            strAccordion += '</tr><tr>'
            strAccordion += '<td class="label">Source:</td><td class="data">' + securityIssue.source + '</td>';
            strAccordion += '</tr><tr>'
            strAccordion += '<td class="label">Threat Category:</td><td class="data">' + securityIssue.threatCategory + '</td>';            
            strAccordion += '</tr><tr>'
            //strAccordion += '<p>url:</p><a href="' + securityIssue.url + '">' + securityIssue.url + '</a>';
            strAccordion += '<td class="label">url:</td><td class="data">' + securityIssue.url + '</td>';
            strAccordion += '</tr>'
            strAccordion += '</table>'
            strAccordion += '</div>';            
        }
        // console.log(strAccordion);
        $("#accordion").html(strAccordion);
        //$('#accordion').accordion({heightStyle: 'content'});
        $('#accordion').accordion({heightStyle: 'panel'});
        // var autoHeight = $( "#accordion" ).accordion( "option", "autoHeight" );
        // $( "#accordion" ).accordion( "option", "autoHeight", false );
        // $("#accordion").accordion();
    }else{
        strAccordion += '<h3>No Security Issues Found</h3>';
        $("#accordion").html(strAccordion);
        //$('#accordion').accordion({heightStyle: 'content'});
        $('#accordion').accordion({heightStyle: 'panel'});

    }  

    //securityurl=<a href="{{{url}}}" target="_blank">url</a>    
}

function showLoader()
{
    $(".loader").fadeIn("slow");
}

function hideLoader(hasError)
{
    //$(".loader").fadeOut("slow");
    document.getElementById("loader").style.display = "none";
    document.getElementById("tabs").style.display = "block";
}

function showError(error)
{
    console.log('showError');
    console.log(error);
    // $("#error").text(error);
    // $("#error").removeClass("hidden");

    $("#error").html(error);
    $("#error").fadeIn("slow");
    $('#error').show();

}



function hideError()
{
    $("#error").fadeOut("slow");
    $('#error').hide();

}


function ChangeIconMessage(showVulnerable)  {
    if(showVulnerable) {
        // send message to background script
        chrome.runtime.sendMessage({ "messagetype" : "newIcon", "newIconPath" : "images/IQ_Vulnerable.png" });
    }
    else{
        // send message to background script
        chrome.runtime.sendMessage({ "messagetype" : "newIcon",  "newIconPath" : "images/IQ_Default.png"});    
    }
}

function setupAccordion(){
    console.log('setupAccordion');
    $('#accordion').find('.accordion-toggle').click(function(){
        //Expand or collapse this panel
        $(this).next().slideToggle('fast');
        //Hide the other panels
        $(".accordion-content").not($(this).next()).slideUp('fast');
    });
}


function sortByProperty(objArray, prop, direction){
    if (arguments.length<2) throw new Error("ARRAY, AND OBJECT PROPERTY MINIMUM ARGUMENTS, OPTIONAL DIRECTION");
    if (!Array.isArray(objArray)) throw new Error("FIRST ARGUMENT NOT AN ARRAY");
    const clone = objArray.slice(0);
    const direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending
    const propPath = (prop.constructor===Array) ? prop : prop.split(".");
    clone.sort(function(a,b){
        for (let p in propPath){
                if (a[propPath[p]] && b[propPath[p]]){
                    a = a[propPath[p]];
                    b = b[propPath[p]];
                }
        }
        // convert numeric strings to integers
        a = a.match(/^\d+$/) ? +a : a;
        b = b.match(/^\d+$/) ? +b : b;
        return ( (a < b) ? -1*direct : ((a > b) ? 1*direct : 0) );
    });
    return clone;
};

