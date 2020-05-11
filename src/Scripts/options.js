/*jslint es6  -W024 */
// import * as utils from "./utils.js";

$(function () {
  $(document).tooltip();
});
// const form = document.getElementById("form");
// form.addEventListener("submit", (e) => {
//   e.preventDefault();
// });
// $("a#tabstooltip").tooltip({
//   open: function (event, ui) {
//     console.log("tooltip open");
//     $(ui.tooltip).append(
//       '<a target="_blank" rel="noreferrer" href="https://developer.chrome.com/extensions/tabs">tabs</a>'
//     );
//   },
// });
window.onload = async () => {
  console.log("window.onload", window.location.search.substring(1));
  // let retVal = await checkOriginsPermissions("https://cocoapods.org/");
  // console.log("retVal", retVal);
  // let allPerms = await checkAllPermissions();
  // console.log("allPerms", allPerms);
  // let cookie = await GetSettings(["IQCookie", "appId"]);
  // console.log("cookie", cookie);
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

  document.getElementById("TestSave").onclick = async () => {
    // let url = "http://iq-server:8070";
    // let theURL = new URL(url);
    // console.log("theURL", theURL);
    // // let perms = await grantOriginsPermissions(theURL.href);
    // // // console.log("perms", perms);
    // // let ss = await setSettings({ foo: "bar" });
    // // console.log("ss", ss);
    // let domain = getDomainName(theURL.href);
    // let cookie = await getCookie2(theURL.href, xsrfCookieName);
    // console.log("cookie", cookie);
    // let thePerms = await checkPermissions("notifications");
    // console.log(thePerms);
    // let isOriginal = await CheckIsOriginalOrigins("https://cocoapods.org/");
    // console.log("isOriginal", isOriginal);
  };
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
    await loginUser();
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
    message("");
    let isChecked = document.getElementById("EnableNexusScan").checked;
    console.log("EnableNexusScan", isChecked);
    let nexusUrl = document.getElementById("nexusurl").value;
    let url, isValidUrl;
    isValidUrl = validateUrl(nexusUrl);
    let nexusRepoUrlHref;
    if (isValidUrl) {
      url = new URL(nexusUrl);
      nexusRepoUrlHref = url.href;
    }
    if (isChecked) {
      if (isValidUrl) {
        //save the url
        let granted = await SetNexusUrl(isChecked, nexusRepoUrlHref);
        if (granted) {
          message("Permission  granted");
        } else {
          message("Permission not granted");
          document.getElementById("EnableNexusScan").checked = false;
        }
      } else {
        //not valid
        document.getElementById("EnableNexusScan").checked = false;
        document.getElementById("nexusurl").focus();
        message("Enter a valid Nexus Repo Url first");
        return;
      }
      console.log("nexusUrl", nexusUrl);
    } else {
      //revoking
      let revoked = await SetNexusUrl(isChecked, nexusRepoUrlHref);
      message("Revoked successfully");
      console.log("revoked", revoked);
    }
  };
};

const SetNexusUrl = async (isChecked, url) => {
  console.log("SetNexusUrl", isChecked, url);
  return new Promise((resolve, reject) => {
    let nexusUrl = new URL(url);
    let nexusUrlHref = nexusUrl.href;

    if (isChecked && !isValidUrl(nexusUrlHref)) {
      setSettings({ hasApprovedNexusUrl: false });
      setSettings({ nexusRepoUrl: "" });

      reject(false);
    }
    if (isChecked) {
      //add the url to the permissionss
      //check that it is not already in the list
      let granted = grantOriginsPermissions(nexusUrlHref);
      if (granted) {
        //good we like this so ok then
        console.log("granted", granted);
        setSettings({ hasApprovedNexusUrl: isChecked });
        setSettings({ nexusRepoUrl: nexusUrlHref });
        resolve(granted);
      } else {
        //he didn't hit grant so remove
        setSettings({ hasApprovedNexusUrl: false });
        setSettings({ nexusRepoUrl: "" });
        resolve(granted);
      }
    } else {
      //remove the origins permission
      //check that it is not a originall permission
      let found = CheckIsOriginalOrigins(nexusUrlHref);
      //remove the permission
      if (found) {
        message("Can not remove an original origin permission");
        reject(false);
      } else {
        let revoked = revokeOriginsPermissions(nexusUrlHref);
        console.log("revoke", revoked);
        console.log("disable");
        setSettings({
          hasApprovedNexusUrl: false,
        });
        setSettings({
          nexusRepoUrl: "",
        });
        resolve(revoked);
      }
    }
  });
};

const SetAllUrls = async (isChecked) => {
  if (isChecked) {
    //add the Tabs permission
    chrome.permissions.request(
      {
        origins: ["*://*/*"],
      },
      (granted) => {
        console.log("requesting");
        setSettings({ hasApprovedAllUrls: isChecked });
      }
    );
  } else {
    //remove the Tabs permission
    chrome.permissions.remove(
      {
        origins: ["*://*/*"],
      },
      () => {
        console.log("removing");
        setSettings({
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
  return new Promise((resolve, reject) => {
    ////
    chrome.cookies.get({ url: url, name: cookieName }, (cookie) => {
      //console.log("cookie", cookie);
      resolve(cookie);
    });
    ////
  });
};

const addPerms = async (url, username, password, appId, appInternalId) => {
  console.log("addPerms(url)", url);
  if (url.slice(-1) !== "/") {
    url = url.concat("/");
  }
  let theURL = new URL(url);
  console.log("theURL", theURL);
  let destUrl = theURL.href;
  let permsGranted = await grantOriginsPermissions(destUrl);
  if (permsGranted) {
    let cookie = await getCookie2(destUrl, xsrfCookieName);
    let saveSetting = await setSettings({ hasApprovedServer: true });
    saveSetting = await setSettings({ IQCookie: cookie });
    saveSetting = await setSettings({ IQCookieSet: Date.now() });
    let loggedIn = await canLogin(destUrl, username, password);
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
};

/////

const canLogin = async (url, username, password) => {
  return new Promise((resolve, reject) => {
    console.log("canLogin", url, username, password);
    message("");
    let baseURL = url + (url.substr(-1) === "/" ? "" : "/");
    let urlEndPoint = baseURL + "rest/user/session";
    let retval;
    axios
      .get(urlEndPoint, {
        auth: {
          username: username,
          password: password,
        },
      })
      .then((data) => {
        console.log("Logged in");
        message("Login successful");
        retval = true;
        resolve(retval);
      })
      .catch((error) => {
        console.error(error);
        message(error);
        retval = false;
        resolve(retval);
      });
  });
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
  return new Promise((resolve, reject) => {
    console.log("load_data");
    let isAbleToLogin = true;
    let url, username, password, appId, appInternalId;
    let hasApprovedServer;
    let hasApprovedContinuousEval, hasApprovedAllUrls;
    let settings = GetSettings(masterSettingsList);
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
        canLogin(url, username, password);
        addApps(url, username, password, appId, appInternalId);
      }
      hasApprovedContinuousEval = settings.hasApprovedContinuousEval;
      console.log("ContinuousEval", hasApprovedContinuousEval);
      document.getElementById(
        "ContinuousEval"
      ).checked = hasApprovedContinuousEval;
      hasApprovedAllUrls = settings.hasApprovedAllUrls;
      console.log("hasApprovedAllUrls", hasApprovedAllUrls);
      document.getElementById("AllUrls").checked = hasApprovedAllUrls;
    }
  });
};

const saveForm = async () => {
  console.log("saveForm");
  return new Promise((resolve, reject) => {
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
    if (!isValidForm(url, username, password, app)) {
      message("Entries not valid");
      isFormOK = false;
      reject(isFormOK);
      return isFormOK;
    }
    let objUrl = new URL(url);
    let nexusIQURL = objUrl.href;
    var appValues = app.split(" ");
    var appInternalId = appValues[0];
    var appId = appValues[1];
    console.log("appValues", appValues, appInternalId);

    setSettings({ url: nexusIQURL });
    setSettings({ username: username });
    setSettings({ password: password });
    setSettings({ appId: appId });
    setSettings({ appInternalId: appInternalId });
    setSettings({
      hasApprovedContinuousEval: hasApprovedContinuousEval,
    });
    setSettings({ hasApprovedAllUrls: hasApprovedAllUrls });

    if (nexusRepoUrl !== "" && validateUrl(nexusRepoUrl)) {
      let nrUrl = new URL(nexusRepoUrl);
      let nexusRepoUrlHref = nrUrl.href;
      let isOriginal = CheckIsOriginalOrigins(nexusRepoUrlHref);
      if (nexusRepoUrlHref === nexusIQURL || isOrignal) {
        message(
          "You can not set Nexus Repo address to one of the original servers, or to the same address as the IQ Server."
        );
        setSettings({ nexusRepoUrl: "" });
        setSettings({ hasApprovedNexusRepoUrl: false });
        isFormOK = false;
      } else {
        setSettings({ nexusRepoUrl: nexusRepoUrlHref });
        setSettings({ hasApprovedNexusRepoUrl: hasApprovedNexusRepoUrl });
      }
    }
    console.log("ok", isFormOK);
    if (isFormOK) {
      message("Saved Values");
      resolve(isFormOK);
    } else {
      reject(isFormOK);
    }
  });
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
  if (CheckIsOriginalOrigins(urlObject.href)) {
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
  console.log("CheckIsOriginalOrigins", urlHref);
  let initialPermissions = (await GetSettings(["installedPermissions"]))
    .installedPermissions;
  console.log("initialPermissions", initialPermissions);
  let found = false;
  for (let origin of initialPermissions.origins) {
    //console.log("origin", origin);
    if (origin.indexOf(urlHref) >= 0) {
      console.log("origin", origin);
      found = true;
      return found;
    }
  }
  return found;
};
