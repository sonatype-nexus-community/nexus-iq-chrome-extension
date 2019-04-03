console.log ('popup.js');
if (typeof chrome !== "undefined"){
    chrome.runtime.onMessage.addListener(gotMessage);
}


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
            //yes we know about this sort of URL so continue
            let artifact = ParsePageURL(url)
            if (artifact){
                //evaluate now
                //as the page has the version so no need to insert dom
                //just parse the URL
                let evaluatemessage = {
                    artifact: artifact,        
                    messagetype: messageTypes.evaluate
                }
                console.log('chrome.runtime.sendMessage(evaluatemessage)');
                console.log(evaluatemessage);
                
                chrome.runtime.sendMessage(evaluatemessage);
            }else{
                //this sends a message to the content tab
                //hopefully it will tell me what it sees
                //this fixes a bug where we did not get the right DOM because we did not know what page we were on
                installScripts(message);
            }
        }
        else{
            alert('This page is not currently handled by this extension.')
        }
    }
}



function executeScripts(tabId, injectDetailsArray)
{
    console.log('executeScripts(tabId, injectDetailsArray')
    console.log(tabId)
    
    function createCallback(tabId, injectDetails, innerCallback) {
        return function () {
            chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
        };
    }

    var callback = null;

    for (var i = injectDetailsArray.length - 1; i >= 0; --i)
        callback = createCallback(tabId, injectDetailsArray[i], callback);

    if (callback !== null)
        callback();   // execute outermost function
}

function installScripts(message){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let tabId = tabs[0].id
        console.log('begin installScripts');
        var background = chrome.extension.getBackgroundPage();
        background.message = message;
        console.log('sending message:',  message);
        executeScripts(null, [ 
            { file: "Scripts/jquery-3.3.1.min.js" }, 
            { file: "Scripts/utils.js" },
            // { code: "var message = " + message  + ";"},
            { file: "Scripts/content.js" },
            { code: "processPage();" }
        ])
        chrome.tabs.sendMessage(tabId, message);
        console.log('end installScripts');
    })
};
 



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

    $("#hash").html(message.message.response.description);
    $("#hash_label").html('Description:');
    
    $("#matchstate").html(message.message.response.reference);
    $("#datasource").html(message.artifact.datasource);
    $("CatalogDate_row").addClass("invisible");
    $("RelativePopularity_Row").addClass("invisible");
    $("#catalogdate").html('-');
    $("#relativepopularity").html('-');

    renderSecuritySummaryOSSIndex(message);
    //document.getElementById("matchstate").innerHTML = componentInfoData.componentDetails["0"].matchState;
    // $("#matchstate").html(message.message.response.reference)
}
function renderLicenseDataOSSIndex(message){
    //not supported
    //$("#tabs-2").addClass("invisible");

    $("#declaredlicenses").html("<h3>OSSIndex does not carry license data</h3>")
    $("#licensetable").addClass("invisible");
}
function renderSecurityDataOSSIndex(message){
 
    let securityIssues = message.message.response.vulnerabilities;
    let strAccordion = '';
    console.log('renderSecurityDataOSSIndex')
    console.log(message)
    console.log(securityIssues.length);
    
    if(securityIssues.length > 0){
        for(i=0; i < securityIssues.length; i++){
            let securityIssue = securityIssues[i];

            //console.log(securityIssue.reference);
            //console.log(i);
            let vulnerabilityCode = ''
            if(typeof securityIssue.cve === "undefined") {
                vulnerabilityCode = " No CVE ";
            }else{
                vulnerabilityCode = securityIssue.cve
            }
            let className = styleCVSS(securityIssue.cvssScore);
            // let vulnerabilityCode = (typeof securityIssue.cve === "undefined") ? 'No CVE' : securityIssue.cve;
            strAccordion += '<h3><span class="headingreference">' + vulnerabilityCode + '</span><span class="headingseverity ' + className +'">CVSS:' + securityIssue.cvssScore + '</span></h3>';
            // strAccordion += '<h3><span class="headingreference">' + vulnerabilityCode + '</span><span class="headingseverity ' + className +'">CVSS:' + securityIssue.cvssScore + '</span></h3>';
            strAccordion += '<div>';
            strAccordion += '<table>';            
            strAccordion += '<tr><td><span class="label">Title:</span></td><td><span class="data">' + securityIssue.title + '</span></td></tr>';
            strAccordion += '<tr><td><span class="label">Score:</span></td><td><span class="data">' + securityIssue.cvssScore + '</span></td></tr>';
            strAccordion += '<tr><td><span class="label">CVSS 3 Vector:</span></td><td><span class="data">' + securityIssue.cvssVector + '</span></td></tr>';
            strAccordion += '<tr><td><span class="label">Description:</span></td><td><span class="data">' + securityIssue.description + '</span></td></tr>';
            strAccordion += '<tr><td><span class="label">Id:</span></td><td><span class="data">' + securityIssue.id + '</span></td></tr>';
            strAccordion += '<tr><td><span class="label">Reference:</span></td><td><span class="data">' + securityIssue.reference + '</span></td></tr>';
            strAccordion += '</table>';
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
        strAccordion += '<div>';
        strAccordion += '</div>';
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
    $("#datasource").html(message.artifact.datasource);
    renderSecuritySummaryIQ(message);
}


function renderSecuritySummaryIQ(message){
    let highest = Highest_CVSS_Score(message);
    let className = styleCVSS(highest);
    $("#Highest_CVSS_Score").html(highest).addClass(className);

    let numIssues = Count_CVSS_Issues(message);
    let theCount = ` within ${numIssues} security issues`
    $("#Num_CVSS_Issues").html(theCount);

}

function renderSecuritySummaryOSSIndex(message){
    let highest = Highest_CVSS_ScoreOSSIndex(message);
    let className = styleCVSS(highest);
    $("#Highest_CVSS_Score").html(highest).addClass(className);

    let numIssues = Count_CVSS_IssuesOSSIndex(message);
    let theCount = ` within ${numIssues} security issues`
    $("#Num_CVSS_Issues").html(theCount);

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

function Highest_CVSS_Score(message){
    console.log('Highest_CVSS_Score(beginning)', message);
    var thisComponent = message.message.response.componentDetails["0"];
 
    //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
    let securityIssues = thisComponent.securityData.securityIssues;
    var highestSecurityIssue = Math.max.apply(Math, securityIssues.map(function(securityIssue) { return securityIssue.severity; }))
    console.log('highestSecurityIssue');
    console.log(highestSecurityIssue);
    
    if (typeof highestSecurityIssue === "undefined" || highestSecurityIssue == -Infinity){
        highestSecurityIssue = 'NA'
    }
    console.log('Highest_CVSS_Score(ending)', highestSecurityIssue);
    return highestSecurityIssue;
    
}
function Highest_CVSS_ScoreOSSIndex(message){
    console.log('Highest_CVSS_Score(beginning)', message);
    var thisComponent = message.message.response;
    
    //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
    let securityIssues = thisComponent.vulnerabilities;
    var highestSecurityIssue = Math.max.apply(Math, securityIssues.map(function(securityIssue) { return securityIssue.cvssScore; }))
    console.log('highestSecurityIssue');
    console.log(highestSecurityIssue);
    
    if (typeof highestSecurityIssue === "undefined" || highestSecurityIssue == -Infinity){
        highestSecurityIssue = 'NA'
    }
    console.log('Highest_CVSS_Score(ending)', highestSecurityIssue);
    return highestSecurityIssue;
    
}


function Count_CVSS_IssuesOSSIndex(message){
    console.log('Count_CVSS_Issues(beginning)', message);
    var thisComponent = message.message.response;
 
    //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
    let securityIssues = thisComponent.vulnerabilities;
    var countCVSSIssues = securityIssues.length;

    console.log('Count_CVSS_Issues(ending)', countCVSSIssues);
    return countCVSSIssues;
    
}

function Count_CVSS_Issues(message){
    console.log('Count_CVSS_Issues(beginning)', message);
    var thisComponent = message.message.response.componentDetails["0"];
 
    //document.getElementById("securityData_securityIssues").innerHTML = componentInfoData.componentDetails["0"].component.componentIdentifier.coordinates.securityData_securityIssues;
    let securityIssues = thisComponent.securityData.securityIssues;
    var countCVSSIssues = securityIssues.length;

    console.log('Count_CVSS_Issues(ending)', countCVSSIssues);
    return countCVSSIssues;
    
}

function styleCVSS(severity){
    let className;
    switch (true){
        case (severity >= 10):
            className = "criticalSeverity" 
            break;
        case (severity >= 7):
            className = "highSeverity" 
            break;
        case (severity >= 5):
            className = "mediumSeverity" 
            break;
        case (severity >= 0):
            className = "lowSeverity" 
            break;
        default:
            className = "noneSeverity" 
            break;
    }
    return className;
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
        for(i=0; i < securityIssues.length; i++){
            let securityIssue = securityIssues[i];
            console.log(securityIssue);

            //console.log(securityIssue.reference);
            //console.log(i);
            let className = styleCVSS(securityIssue.severity);
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
    let displayError;
    // $("#error").text(error);
    // $("#error").removeClass("hidden");
    //OSSINdex responds with HTML and not JSON if there is an error
    let errorText
    if (typeof error.statusText !== "undefined"){
        errorText = error.statusText;
    }
    if (errorText.search('<html>')>-1){
        if (typeof error.responseText !== "undefined"){
            let errorText = error.responseText;
            var el = document.createElement( 'html' );
            el.innerHTML = errorText;
    
            displayError = el.getElementsByTagName( 'title' ); // Live NodeList of your anchor elements
            }
        else{
            displayError = "Unknown error"
        }
    }else{
        displayError = errorText;
    }
    $("#error").html(displayError);
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

