export enum messageTypes {
  annotateComponent = "annotateComponent",
  artifact = "artifact", //passing a artifact/package identifier from content to the background to kick off the eval
  beginEvaluate = "beginEvaluate", //message to send that we are beginning the evaluation process, it's different to the evaluatew message for a readon that TODO I fgogot
  displayMessage = "displayMessage", //message to send that we have data from REST and wish to display it
  error = "error", //used to pass errors from background and content script to the popup
  evaluate = "evaluate", //message to send that we are evaluating
  evaluateComponent = "evaluateComponent", //used to evaluate on the popup only
  loggedIn = "loggedIn", //message to send that we are in the loggedin
  login = "login", //message to send that we are in the process of logging in
  loginFailedMessage = "loginFailedMessage", //message to send that login failed
  vulnerability = "vulnerability", // vuln scan results
}


