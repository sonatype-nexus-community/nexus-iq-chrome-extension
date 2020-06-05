import axios from "axios";
import { xsrfCookieName, xsrfHeaderName } from "./utils";
import { messageTypes } from "./MessageTypes";

var browser;
if (typeof chrome !== "undefined") {
  browser = chrome;
}
const callServer = async (valueCSRF, artifact, settings, nexusArtifact) => {
  //purpose is initial get object details
  console.log("callServer", valueCSRF, artifact, settings, nexusArtifact);

  console.log("nexusArtifact", nexusArtifact);
  let inputStr = JSON.stringify(nexusArtifact);
  console.log("inputStr", inputStr);
  let retVal;
  let error = 0;
  let servername = settings.baseURL;
  let url = `${servername}api/v2/components/details`;
  let responseVal;
  let displayMessage;
  console.log("CSRF", valueCSRF);
  // let cookieName = "CLM-CSRF-TOKEN";
  // let xsrfHeaderName = "X-CSRF-TOKEN";
  let response = await axios(url, {
    method: "post",
    data: nexusArtifact,
    withCredentials: true,
    xsrfCookieName: xsrfCookieName,
    xsrfHeaderName: xsrfHeaderName,
    auth: {
      username: settings.username,
      password: settings.password,
    },
    headers: {
      [xsrfHeaderName]: valueCSRF,
    },
  })
    .then((data) => {
      console.log("axios then", data);
      responseVal = data.data;
      retVal = { error: error, response: responseVal };
      // addCookies(servername);
    })
    .catch((error) => {
      console.log("error", error);
      let code, response;
      if (!error.response) {
        // network error
        code = 1;
        responseVal = `Server unreachable ${url}. ${error.toString()}`;
      } else {
        // http status code
        code = error.response.status;
        // response data
        responseVal = error.response.data;
      }
      retVal = { error: code, response: responseVal }; // error = error.response;
    });
  //handle error
  // console.log(xhr);
  // error = xhr.status;
  // response = xhr.responseText;
  displayMessage = {
    messagetype: messageTypes.displayMessage,
    message: retVal,
    artifact: artifact,
  };
  console.log("callServer - displayMessage", displayMessage);

  return displayMessage;
};


const addCookies = (url) => {
  return;

  console.log("addCookies", url);
  browser.cookies.set({
    url: url,
    name: "CLMSESSIONID", //"CLM-CSRF-TOKEN"
    value: "foo",
  });
  return;
};
export { callServer, addCookies };
