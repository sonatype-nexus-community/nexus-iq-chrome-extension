/*jslint es6  -W024 */
// import * as utils from "./utils.js";

$(function () {
  $(document).tooltip();
});

window.onload = async () => {
  console.log("window.onload", window.location.search.substring(1));
  message("");
  load_data();

  function getQueryVar(varName) {
    console.log("getQueryVar", varName);
    // Grab and unescape the query string - appending an '&' keeps the RegExp simple
    // for the sake of this example.
    var queryStr = unescape(window.location.search) + "&";
    // Dynamic replacement RegExp
    var regex = new RegExp(".*?[&\\?]" + varName + "=(.*?)&.*");
    // Apply RegExp to the query string
    var val = queryStr.replace(regex, "$1");
    // If the string is the same, we didn't find a match - return false
    return val == queryStr ? false : val;
  }
  //if connected=false is sent
  if (
    window.location.search.substring(1) &&
    getQueryVar("connected") === "false"
  ) {
    message("Not connected. You have to log in before using the plugin.");
  }

  // document.getElementById('url').focus();
  document.getElementById("cancel").onclick = async () => {
    try {
      var ok = true;
      if (ok) {
        window.close();
      }
    } catch (error) {
      //if error then tell them that this browser does not allow closing popups
      alert(
        "Closing forms not allowed by this browser. You will need to close the tab yourself."
      );
    }
  };
  document.getElementById("login").onclick = async () => {
    try {
      await loginUser();
    } catch (error) {
      message(error);
    }
  };

  document.getElementById("save").onclick = async () => {
    await saveForm();
  };

  document.getElementById("ContinuousEval").onclick = async () => {
    let isChecked = document.getElementById("ContinuousEval").checked;
    console.log("isChecked", isChecked);
    if (isChecked) {
      await ContinuousEval(isChecked);
    } else {
      await ContinuousEval(isChecked);
    }
  };
  document.getElementById("AllUrls").onclick = async () => {
    let isChecked = document.getElementById("AllUrls").checked;
    console.log("AllUrls", isChecked);
    if (isChecked) {
      await SetAllUrls(isChecked);
    } else {
      await SetAllUrls(isChecked);
    }
  };
  //
  document.getElementById("nexusurl").oninput = async () => {
    message("Remember to set the Enable Nexus Switch");
    document.getElementById("EnableNexusScan").checked = false;
  };
  document.getElementById("EnableNexusScan").onclick = async () => {
    let repoManager = repositoryManagers.nexus;
    let elRepoEnable = "EnableNexusScan";
    let elRepoAddress = "nexusurl";
    let approvalSetting = "hasApprovedNexusRepoUrl";
    let repoAddressSetting = "nexusRepoUrl";
    await handleRepoSwitch(
      repoManager,
      elRepoEnable,
      elRepoAddress,
      approvalSetting,
      repoAddressSetting
    );
  };
};

const SetNexusUrl = async (isChecked, url) => {
  console.log("SetNexusUrl", isChecked, url);
  return new Promise(async (resolve, reject) => {
    let nexusUrl = new URL(url);
    let nexusUrlHref = nexusUrl.href;
    let isValid = await isValidUrl(nexusUrlHref);
    if (isChecked && !isValid) {
      await setSettings({ hasApprovedNexusUrl: false });
      await setSettings({ nexusRepoUrl: "" });

      reject(false);
    }
    if (isChecked) {
      //add the url to the permissionss
      //check that it is not already in the list
      let granted = await grantOriginsPermissions(nexusUrlHref);
      if (granted) {
        //good we like this so ok then
        console.log("granted", granted);
        await setSettings({ hasApprovedNexusUrl: isChecked });
        await setSettings({ nexusRepoUrl: nexusUrlHref });
        resolve(granted);
      } else {
        //he didn't hit grant so remove
        await setSettings({ hasApprovedNexusUrl: false });
        await setSettings({ nexusRepoUrl: "" });
        resolve(granted);
      }
    } else {
      //remove the origins permission
      //check that it is not a originall permission
      let found = await CheckIsOriginalOrigins(nexusUrlHref);
      //remove the permission
      if (found) {
        message("Can not remove an original origin permission");
        reject(false);
      } else {
        let revoked = await revokeOriginsPermissions(nexusUrlHref);
        console.log("revoke", revoked);
        console.log("disable");
        await setSettings({
          hasApprovedNexusUrl: false,
        });
        await setSettings({
          nexusRepoUrl: "",
        });
        resolve(revoked);
      }
    }
  });
};
//////////////

document.getElementById("artifactoryurl").oninput = async () => {
  message("Remember to set the Enable Artifactory Switch");
  document.getElementById("EnableArtifactoryScan").checked = false;
};
document.getElementById("EnableArtifactoryScan").onclick = async () => {
  let repoManager = repositoryManagers.artifactory;
  let elRepoEnable = "EnableArtifactoryScan";
  let elRepoAddress = "artifactoryurl";
  let approvalSetting = "hasApprovedArtifactoryRepoUrl";
  let repoAddressSetting = "artifactoryRepoUrl";
  await handleRepoSwitch(
    repoManager,
    elRepoEnable,
    elRepoAddress,
    approvalSetting,
    repoAddressSetting
  );
};

const handleRepoSwitch = async (
  repoManager,
  elRepoEnable,
  elRepoAddress,
  approvalSetting,
  repoAddressSetting
) => {
  /////

  message("");
  let isChecked = document.getElementById(elRepoEnable).checked;
  console.log("handleRepoSwitch", isChecked);
  let repoUrl = document.getElementById(elRepoAddress).value;
  let url, isValidUrl;
  isValidUrl = await validateUrl(repoUrl);
  console.log("EnableRepoScan-isValidUrl", repoUrl);

  let repoUrlHref;
  if (isValidUrl) {
    url = new URL(repoUrl);
    repoUrlHref = url.href;
  }
  if (isChecked) {
    //granting
    if (isValidUrl) {
      //save the url
      let granted = await SetRepoUrl(
        repoManager,
        isChecked,
        repoUrlHref,
        approvalSetting,
        repoAddressSetting
      );
      if (granted) {
        message("Permission  granted");
      } else {
        message("Permission not granted");
        document.getElementById(elRepoEnable).checked = false;
      }
    } else {
      //not valid
      document.getElementById(elRepoEnable).checked = false;
      document.getElementById(elRepoAddress).focus();
      let prompt = document.getElementById(elRepoAddress).placeholder;
      message(`Enter a valid ${prompt} first`);
      return;
    }
    console.log("repoUrl", repoUrl);
  } else {
    //revoking
    let revoked = await SetRepoUrl(
      repoManager,
      isChecked,
      repoUrlHref,
      approvalSetting,
      repoAddressSetting
    );
    message("Revoked successfully");
    console.log("revoked", revoked);
  }
};

const SetRepoUrl = async (
  repoManager,
  isChecked,
  url,
  approvalSetting,
  repoAddressSetting
) => {
  console.log("SetRepoUrl", isChecked, url);
  return new Promise(async (resolve, reject) => {
    let repoUrl = new URL(url);
    let repoUrlHref = repoUrl.href;
    let isValid = await isValidUrl(repoUrlHref);
    if (isChecked && !isValid) {
      await setSettings({ [approvalSetting]: false });
      await setSettings({ [repoAddressSetting]: "" });

      reject(false);
    }
    if (isChecked) {
      //add the url to the permissionss
      //check that it is not already in the list
      let granted = await grantOriginsPermissions(repoUrlHref);
      if (granted) {
        //good we like this so ok then
        console.log("granted", granted);
        await setSettings({ [approvalSetting]: granted });
        await setSettings({ [repoAddressSetting]: repoUrlHref });
        resolve(granted);
      } else {
        //he didn't hit grant so remove
        await setSettings({ [approvalSetting]: granted });
        await setSettings({ [repoAddressSetting]: "" });
        resolve(granted);
      }
    } else {
      //remove the origins permission
      //check that it is not a originall permission
      let found = await CheckIsOriginalOrigins(repoUrlHref);
      //remove the permission
      if (found) {
        message("Can not remove an original origin permission");
        reject(false);
      } else {
        let revoked = await revokeOriginsPermissions(repoUrlHref);
        console.log("revoke", revoked);
        console.log("disable");
        await setSettings({ [approvalSetting]: false });
        await setSettings({ [repoAddressSetting]: "" });
        resolve(revoked);
      }
    }
  });
};
//////////////
const SetAllUrls = async (isChecked) => {
  if (isChecked) {
    //add the Tabs permission
    chrome.permissions.request(
      {
        origins: ["*://*/*"],
      },
      async (granted) => {
        console.log("requesting");
        await setSettings({ hasApprovedAllUrls: isChecked });
      }
    );
  } else {
    //remove the Tabs permission
    chrome.permissions.remove(
      {
        origins: ["*://*/*"],
      },
      async () => {
        console.log("removing");
        await setSettings({
          hasApprovedAllUrls: isChecked,
        });
      }
    );
  }
};

const ContinuousEval = async (isChecked) => {
  return new Promise((resolve, reject) => {
    if (isChecked) {
      //add the Tabs permission
      chrome.permissions.request(
        {
          permissions: ["tabs", "notifications"],
        },
        async (granted) => {
          console.log("requesting");
          await setSettings({ hasApprovedContinuousEval: isChecked });
          resolve(true);
        }
      );
    } else {
      //remove the Tabs permission
      chrome.permissions.remove(
        {
          permissions: ["tabs", "notifications"],
        },
        async () => {
          console.log("removing");
          await setSettings({
            hasApprovedContinuousEval: isChecked,
          });
        }
      );
      resolve(true);
    }
  });
};

const checkPermissions = async (permission) => {
  return new Promise((resolve, reject) => {
    // console.log("perms", permission);
    chrome.permissions.contains(
      {
        permissions: [permission],
      },
      (data) => {
        resolve(data);
      }
    );
  });
};

const checkOriginsPermissions = async (url) => {
  return new Promise((resolve, reject) => {
    chrome.permissions.contains(
      {
        origins: [url],
      },
      (data) => {
        resolve(data);
      }
    );
  }); // return "foo";
};

const loginUser = async () => {
  return new Promise((resolve, reject) => {
    console.log("login");
    var url = document.getElementById("url").value;
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if (url === "" || username === "" || password === "" || !validateUrl(url)) {
      console.log("not valid entries");
      message("Please provide valid IQ Server, Username and Password");
    } else {
      let app = document.getElementById("appId").value;
      let appValues = app.split(" ");
      let appInternalId = appValues[0];
      let appId = appValues[1];
      addPerms(url, username, password, appId, appInternalId);
    }
  });
};
const revokeOriginsPermissions = async (url) => {
  return new Promise((resolve, reject) => {
    let objUrl = new URL(url);
    let urlHref = objUrl.href;
    chrome.permissions.remove(
      {
        origins: [urlHref],
      },
      async (removed) => {
        resolve(removed);
      }
    );
  });
};

const grantOriginsPermissions = async (url) => {
  console.log("grantOriginsPermissions", url);
  return new Promise((resolve, reject) => {
    ///
    console.log("url", url);
    chrome.permissions.request(
      {
        origins: [url],
      },
      (granted) => {
        if (granted) {
          resolve(granted);
        } else {
          resolve(granted);
        }
      }
    );

    ///
  });
};

const getCookie2 = async (url, cookieName) => {
  console.log("getCookie2", url, cookieName);
  return new Promise((resolve, reject) => {
    ////
    chrome.cookies.get({ url: url, name: cookieName }, (cookie) => {
      console.log("cookie", cookie, url, cookieName);
      resolve(cookie);
    });
    ////
  });
};

const addPerms = async (url, username, password, appId, appInternalId) => {
  console.log("addPerms(url)", url, username, password, appId, appInternalId);
  if (url.slice(-1) !== "/") {
    url = url.concat("/");
  }
  let theURL = new URL(url);
  console.log("theURL", theURL);
  let destUrl = theURL.href;
  let permsGranted = await grantOriginsPermissions(destUrl);
  if (permsGranted) {
    // return permsGranted;
    //now we attempt to login wich creates the cookie

    let loggedIn = await canLogin(destUrl, username, password);
    if (!loggedIn) return;
    let cookie = await getCookie2(destUrl, xsrfCookieName);
    let token, expires;
    let saveSetting;

    if (!cookie || cookie === null) {
      //lets create that cookieiD and see how we go
      token = uuidv4();
      var oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      expires = jsDateToEpoch(oneYearFromNow);
      // message("Error retrieving cookie. Click login again");
      // return;
    } else {
      token = cookie.value;
      expires = cookie.expires;
      saveSetting = await setSettings({ IQCookie: cookie });
    }
    saveSetting = await setSettings({ hasApprovedServer: true });
    saveSetting = await setSettings({ IQCookieToken: token });
    saveSetting = await setSettings({ IQCookieSet: Date.now() });
    saveSetting = await setSettings({ IQCookieExpires: expires });

    let addedApp = await addApps(
      destUrl,
      username,
      password,
      appId,
      appInternalId
    );
    console.log("addedApp", addedApp, loggedIn, saveSetting);
  } else {
    {
      let saveSetting = await setSettings({ hasApprovedServer: false });
    }
  }
  return true;
};

/////
const zzzzcanLogin = async (url, username, password) => {
  return new Promise((resolve, reject) => {
    let tok = `${username}:${password}`;
    let hash = btoa(tok);
    let auth = "Basic " + hash;
    let urlEndPoint = url + "rest/user/session";
    let options = {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      redirect: "follow", // manual, *follow, error
      // referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    };
    fetch(urlEndPoint, options)
      .then((response) => {
        console.log(response, response.json);
        response.json();
      })
      .then((data) => {
        console.log(data);
        resolve(data);
      })
      .catch((error) => {
        console.log("can login error", error);
        reject(error);
      });
  });
};
const zzloginTest = async (url, username, password) => {
  console.log("url", url);
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  let tok = `${username}:${password}`;
  let hash = btoa(tok);
  let auth = "Basic " + hash;
  request.setRequestHeader("Authorization", auth);

  request.onload = function () {
    // Begin accessing JSON data here

    // Begin accessing JSON data here
    var data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
      return data;
    } else {
      console.log("error");
    }
  };

  // Send request
  request.send();
};

const addApps = async (url, username, password, appId, appInternalId) => {
  return new Promise((resolve, reject) => {
    console.log("addApps", appId, appInternalId);
    console.log(url, username, password);
    let theurl = new URL(url);
    let baseURL = theurl.href;
    let urlListApp =
      baseURL + "rest/integration/applications?goal=EVALUATE_COMPONENT";
    // removeCookies(baseURL);
    axios
      .get(urlListApp, {
        auth: {
          username: username,
          password: password,
        },
      })
      .then((data) => {
        console.log(data.data.applicationSummaries);
        let apps = data.data.applicationSummaries;
        let i = 1;
        $("#appId").empty();
        apps.forEach((element) => {
          $("#appId").append(
            $("<option>", {
              value: element.id + " " + element.publicId,
              text: element.name,
            })
          );
        });
        $("#appId").val(appInternalId + " " + appId);
        // $("#appId").disabled=false;
        document.getElementById("appId").disabled = false;
        // console.log($("#appId").value)
        console.log("addApps successful");
        resolve($("#appId").length);
      })
      .catch((appError) => {
        console.error(appError);
        message(appError);
        resolve(false);
      });
  });
};

const load_data = async () => {
  return new Promise(async (resolve, reject) => {
    console.log("load_data");
    let isAbleToLogin = true;
    let url, username, password, appId, appInternalId;
    let hasApprovedServer;
    let hasApprovedContinuousEval, hasApprovedAllUrls;
    let settings = await GetSettings(masterSettingsList);
    console.log("settings", settings);

    if (
      typeof settings.url === "undefined" ||
      typeof settings.username === "undefined" ||
      typeof settings.password === "undefined"
    ) {
      hasApprovedServer = false;
    } else {
      url = settings.url;
      document.getElementById("url").value = url;
      username = settings.username;
      document.getElementById("username").value = username;
      password = settings.password;
      document.getElementById("password").value = password;
      appId = settings.appId;
      appInternalId = settings.appInternalId;
      hasApprovedServer = settings.hasApprovedServer;
      hasApprovedAllUrls = settings.hasApprovedAllUrls;
      console.log("load_data canLogin", isAbleToLogin);

      if (hasApprovedServer) {
        document.getElementById("appId").disabled = false;
        await canLogin(url, username, password);
        await addApps(url, username, password, appId, appInternalId);
      }
      hasApprovedContinuousEval = settings.hasApprovedContinuousEval;
      console.log("ContinuousEval", hasApprovedContinuousEval);
      document.getElementById(
        "ContinuousEval"
      ).checked = hasApprovedContinuousEval;
      hasApprovedAllUrls = settings.hasApprovedAllUrls;
      console.log("hasApprovedAllUrls", hasApprovedAllUrls);
      document.getElementById("AllUrls").checked = hasApprovedAllUrls;
      document.getElementById("nexusurl").value = settings.nexusRepoUrl || "";
      let isNexus = settings.hasApprovedNexusRepoUrl;
      console.log("isNexusApproved", isNexus);
      document.getElementById("EnableNexusScan").checked = isNexus || false;
      ///
      document.getElementById("artifactoryurl").value =
        settings.artifactoryRepoUrl || "";

      document.getElementById("EnableArtifactoryScan").checked =
        settings.hasApprovedArtifactoryRepoUrl || false;

      ///
    }
  });
};

const saveForm = async () => {
  console.log("saveForm");

  let isFormOK = true;
  var url = document.getElementById("url").value;

  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var app = document.getElementById("appId").value;
  let hasApprovedContinuousEval = document.getElementById("ContinuousEval")
    .checked;
  let hasApprovedAllUrls = document.getElementById("AllUrls").checked;
  let hasApprovedNexusRepoUrl = document.getElementById("EnableNexusScan")
    .checked;
  let nexusRepoUrl = document.getElementById("nexusurl").value;
  let hasApprovedArtifactoryRepoUrl = document.getElementById(
    "EnableArtifactoryScan"
  ).checked;
  let artifactoryRepoUrl = document.getElementById("artifactoryurl").value;

  if (!isValidForm(url, username, password, app)) {
    message(
      "Entries not valid. You need to fill in the URL, username, password, application and approve the permissions for the URL."
    );
    isFormOK = false;
    return isFormOK;
  }
  let objUrl = new URL(url);
  let nexusIQURL = objUrl.href;
  var appValues = app.split(" ");
  var appInternalId = appValues[0];
  var appId = appValues[1];
  console.log("appValues", appValues, appInternalId);

  await setSettings({ url: nexusIQURL });
  await setSettings({ username: username });
  await setSettings({ password: password });
  await setSettings({ appId: appId });
  await setSettings({ appInternalId: appInternalId });
  await setSettings({
    hasApprovedContinuousEval: hasApprovedContinuousEval,
  });
  await setSettings({ hasApprovedAllUrls: hasApprovedAllUrls });

  let repoOK;
  repoOK = await setRepoSettings(
    nexusRepoUrl,
    hasApprovedNexusRepoUrl,
    nexusIQURL
  );
  isFormOK = isFormOK && repoOK;
  repoOK = await setRepoSettings(
    artifactoryRepoUrl,
    hasApprovedArtifactoryRepoUrl,
    nexusIQURL
  );
  isFormOK = isFormOK && repoOK;

  console.log("ok", isFormOK);
  if (isFormOK) {
    message("Saved Values");
    return isFormOK;
  } else {
    message("Form not saved");
    return isFormOK;
  }
};

const setRepoSettings = async (repoUrl, hasApprovedRepoUrl, nexusIQURL) => {
  let isFormOK = false;

  if (repoUrl !== "" && validateUrl(repoUrl)) {
    let nrUrl = new URL(repoUrl);
    let repoUrlHref = nrUrl.href;
    let isOriginal = await CheckIsOriginalOrigins(repoUrlHref);
    if (repoUrlHref === nexusIQURL || isOriginal) {
      message(
        "You can not set Nexus Repo address to one of the original servers, or to the same address as the IQ Server."
      );
      await setSettings({ [repoUrl]: "" });
      await setSettings({ [hasApprovedRepoUrl]: false });
      isFormOK = false;
    } else {
      await setSettings({ [repoUrl]: repoUrlHref });
      await setSettings({ [hasApprovedRepoUrl]: hasApprovedRepoUrl });
      isFormOK = true;
    }
  }
  if (!hasApprovedRepoUrl) {
    isFormOK = true;
  }
  return isFormOK;
};

const message = async (strMessage) => {
  let msg = document.getElementById("error");
  msg.innerHTML = strMessage;
};

const isValidForm = (url, username, password, app) => {
  console.log("isValidForm", url, username, password, app);
  if (
    url === "" ||
    username === "" ||
    password === "" ||
    app === "" ||
    !isValidUrl(url)
  ) {
    message("Please fill in all required options above before saving.");
    return false;
  }
  return true;
};

const isValidUrl = async (url) => {
  console.log("isValidUrl", url);
  //has to be non null, non empty, not undefined
  //can not be in the original origins list
  if (typeof url === "undefined" || !url) return false;
  if (!validateUrl(url)) return false;
  let urlObject = new URL(url);
  if (await CheckIsOriginalOrigins(urlObject.href)) {
    return false;
  }
  return true;
};

const validateEnteredUrl = (nexusRepoUrl, nexusIQURL) => {
  //has to be non null, non empty, not undefined
  //can not be in the original origins list
  //can not be the same as the other element
  if (isValidUrl(nexusRepoUrl) && isValidUrl(nexusIQURL)) {
    let nrUrl = new URL(nexusRepoUrl);
    let nexusRepoUrlHref = nrUrl.href;
    let nexusIQ = new URL(nexusIQURL);
    let nexusIQHref = nexusIQ.href;
    if (nexusIQHref === nexusRepoUrlHref) {
      message(
        "You can not set Nexus Repo address to one of the original servers, or to the same address as the IQ Server."
      );
      return false;
    } else {
      return true;
    }
  }
  return false;
};

const CheckIsOriginalOrigins = async (urlHref) => {
  return new Promise(async (resolve, reject) => {
    console.log("CheckIsOriginalOrigins", urlHref);
    let initialPermissions = await GetSettings(["installedPermissions"]);
    console.log("initialPermissions", initialPermissions.installedPermissions);
    let perms = initialPermissions.installedPermissions;
    let found = false;
    for (let origin of perms.origins) {
      //console.log("origin", origin);
      if (origin.indexOf(urlHref) >= 0) {
        console.log("origin", origin);
        found = true;
        resolve(found);
      }
    }
    resolve(found);
  });
};
