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
    let thePerms = await checkPermissions("notifications");
    console.log(thePerms);
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
    if (isValidUrl) {
      url = new URL(nexusUrl);
    }
    if (isChecked) {
      if (!isValidUrl) {
        //not valid
        document.getElementById("EnableNexusScan").checked = false;
        message("Not a valid Nexus Repo Url");
      } else {
        //save the url
        let granted = await grantOriginsPermissions(url.href);
        if (granted) {
          //good we like this so ok then
          console.log("granted", granted);
        } else {
          document.getElementById("EnableNexusScan").checked = false;
          message("Permission not granted");
        }
      }
      console.log("nexusUrl", nexusUrl);
    } else {
      //remove the permission
      let inOriginal = CheckIsOriginalOrigins(url.href);
      if (!inOriginal) {
        revoke;
      }
      console.log("disable");
    }
  };
};

const message = async (strMessage) => {
  let msg = document.getElementById("error");
  msg.innerHTML = strMessage;
};

const saveForm = async () => {
  return new Promise(async (resolve, reject) => {
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
    if (
      url === "" ||
      username === "" ||
      password === "" ||
      app === "" ||
      !validateUrl(url)
    ) {
      message("Please fill in all options above before saving");
      return;
    }
    var appValues = app.split(" ");
    var appInternalId = appValues[0];
    var appId = appValues[1];
    console.log("appValues", appValues, appInternalId);

    await setSettings({ url: url });
    await setSettings({ username: username });
    await setSettings({ password: password });
    await setSettings({ appId: appId });
    await setSettings({ appInternalId: appInternalId });
    await setSettings({
      hasApprovedContinuousEval: hasApprovedContinuousEval,
    });
    await setSettings({ hasApprovedAllUrls: hasApprovedAllUrls });
    await setSettings({ hasApprovedNexusRepoUrl: hasApprovedNexusRepoUrl });
    if (nexusRepoUrl !== "" && validateUrl(nexusRepoUrl)) {
      let nrUrl = new URL(nexusRepoUrl);
      let nexusRepoUrlHref = nrUrl.href;
      await setSettings({ nexusRepoUrl: nexusRepoUrlHref });
    }
    var ok = true;
    if (ok) {
      message("Saved Values");
      resolve(true);
    } else {
      reject(false);
    }
  });
};

const zzsaveForm = async () => {
  var url = document.getElementById("url").value;
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var app = document.getElementById("appId").value;
  let hasApprovedContinuousEval = document.getElementById("ContinuousEval")
    .checked;
  //
  let hasApprovedAllUrls = document.getElementById("AllUrls").checked;
  let hasApprovedNexus = document.getElementById("EnableNexusScan").checked;
  let nexusUrl = document.getElementById("nexusurl").value;

  if (
    url === "" ||
    username === "" ||
    password === "" ||
    app === "" ||
    !validateUrl(url)
  ) {
    message("Please fill in all options above before saving");
    return;
  }
  var appValues = app.split(" ");
  var appInternalId = appValues[0];
  var appId = appValues[1];
  console.log("appValues", appValues, appInternalId);
  //alert(value);
  chrome.storage.sync.set({ url: url }, async () => {
    //alert('saved'+ value);
  });
  chrome.storage.sync.set({ username: username }, async () => {
    //alert('saved'+ value);
  });
  chrome.storage.sync.set({ password: password }, async () => {
    //alert('saved'+ value);
  });
  chrome.storage.sync.set({ appId: appId }, async () => {
    //alert('saved'+ value);
    console.log("Saved appId", appId);
  });
  chrome.storage.sync.set({ appInternalId: appInternalId }, async () => {
    //alert('saved'+ value);
    console.log("Saved appInternalId", appInternalId);
  });

  chrome.storage.sync.set(
    { hasApprovedContinuousEval: hasApprovedContinuousEval },
    async () => {
      //alert('saved'+ value);
      console.log("Saved hasApprovedContinuousEval", hasApprovedContinuousEval);
    }
  );
  chrome.storage.sync.set(
    { hasApprovedAllUrls: hasApprovedAllUrls },
    async () => {
      //alert('saved'+ value);
      console.log("Saved hasApprovedAllUrls", hasApprovedAllUrls);
    }
  );

  chrome.storage.sync.set({ hasApprovedNexus: hasApprovedNexus }, async () => {
    //alert('saved'+ value);
    console.log("Saved hasApprovedNexus", hasApprovedNexus);
  });

  if (nexusUrl !== "" && validateUrl(nexusUrl)) {
    chrome.storage.sync.set({ nexusUrl: nexusUrl }, async () => {
      //alert('saved'+ value);
      console.log("Saved nexusUrl", nexusUrl);
    });
  }
  var ok = true;
  if (ok) {
    message("Saved Values");

    // window.close();
  }
  // load_data();
};

const isValidUrl = async (url) => {
  //has to be non null, non empty, not undefined
  //can not be in the original origins list
  //can not be the same as the other element
  if (typeof url === "undefined" || !url) return false;
  let urlObject = new URL(url);
  if (CheckIsOriginalOrigins(urlObject.href)) {
    return false;
  }
  return true;
};

const SetNexusUrl = async (isChecked, url) => {
  return new Promise(async (resolve, reject) => {
    let nexusUrl = new URL(url);
    let nexusUrlHref = nexusUrl.href;
    if (isChecked && isValidUrl(nexusUrlHref)) {
      //add the url to the permissionss
      //check that it is not already in the list
      chrome.permissions.request(
        {
          origins: [nexusUrlHref],
        },
        async (granted) => {
          console.log("requesting");
          await setSettings({ hasApprovedNexusUrl: isChecked });
          await setSettings({ nexusRepoUrl: nexusUrlHref });
        }
      );
    } else {
      //remove the origins permission
      //check that it is not a originall permission
      let found = CheckIsOriginalOrigins(nexusUrlHref);
      if (!found) {
        chrome.permissions.remove(
          {
            origins: [nexusUrlHref],
          },
          async () => {
            console.log("removing");
            await setSettings({
              hasApprovedNexusUrl: isChecked,
            });
            await setSettings({
              nexusRepoUrl: "",
            });
          }
        );
      } else {
        //can't remove this
        message("Can not remove an original origin permission");
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
  return new Promise(async (resolve, reject) => {
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
  return new Promise(async (resolve, reject) => {
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
      await addPerms(url, username, password, appId, appInternalId);
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

/////

const zzcanLogin = async (url, username, password) => {
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
    })
    .catch((error) => {
      console.error(error);
      message(error);
      retval = false;
    });
  return retval;
};

const zzGetCookieFromURL = async (url, name) => {
  await chrome.cookies.get({ url: url, name: name }, async (cookie) => {
    console.log("cookie", cookie);
    return cookie;
  });
};
const zzStoreCookieInStorage = async (cookie) => {
  await chrome.storage.sync.set({ IQCookie: cookie }, async () => {
    //alert('saved'+ value);
    console.log("Saved cookie.value", cookie);
  });
};

const zzaddApps = async (url, username, password, appId, appInternalId) => {
  console.log("addApps", appId, appInternalId);
  console.log(url, username, password);
  let baseURL = url + (url.substr(-1) === "/" ? "" : "/");
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
      return $("#appId").length;
    })
    .catch((appError) => {
      console.error(appError);
      message(appError);
      return false;
    });
  return;
};

const zzaddPerms = async (url, username, password, appId, appInternalId) => {
  //chrome.permissions.request
  // return;
  console.log("addPerms(url)", url);
  if (url.slice(-1) !== "/") {
    url = url.concat("/");
  }
  chrome.permissions.request(
    {
      origins: [url],
    },
    async (granted) => {
      if (granted) {
        chrome.storage.sync.set({ hasApprovedServer: true }, async () => {
          //alert('saved'+ value);
        });
        // The permissions have been granted.
        console.log("granted");
        await chrome.cookies.get(
          { url: url, name: xsrfCookieName },
          async (cookie) => {
            console.log("cookie", cookie);
            await chrome.storage.sync.set({ IQCookie: cookie }, async () => {
              //alert('saved'+ value);
              console.log("Saved cookie.value", cookie);
            });
            await chrome.storage.sync.set(
              { IQCookieSet: Date.now() },
              async () => {
                //alert('saved'+ value);
                console.log("Saved time", Date.now());
              }
            );
            await canLogin(url, username, password);
            await addApps(url, username, password, appId, appInternalId);
          }
        );
      } else {
        chrome.storage.sync.set({ hasApprovedServer: false }, async () => {
          //alert('saved'+ value);
        });
        console.log("not granted");
      }
    }
  );
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
    ///////

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
      //Appid is a selection? maybe should just be a free text box
      //Need to login to get the list of apps

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

      //hasApprovedAllUrls
      hasApprovedAllUrls = settings.hasApprovedAllUrls;
      console.log("hasApprovedAllUrls", hasApprovedAllUrls);
      document.getElementById("AllUrls").checked = hasApprovedAllUrls;
    }
    ///////
  });
};

const zzload_data = async () => {
  console.log("load_data");
  let isAbleToLogin = true;
  let url, username, password, appId, appInternalId;
  let hasApprovedServer;
  let hasApprovedContinuousEval, hasApprovedAllUrls;
  chrome.storage.sync.get(
    [
      "url",
      "username",
      "password",
      "appId",
      "appInternalId",
      "hasApprovedServer",
      "hasApprovedContinuousEval",
      "hasApprovedAllUrls",
    ],
    async (data) => {
      console.log("data", data);
      if (
        typeof data.url === "undefined" ||
        typeof data.username === "undefined" ||
        typeof data.password === "undefined"
      ) {
        hasApprovedServer = false;
      } else {
        url = data.url;
        document.getElementById("url").value = url;
        username = data.username;
        document.getElementById("username").value = username;
        password = data.password;
        document.getElementById("password").value = password;
        appId = data.appId;
        appInternalId = data.appInternalId;
        hasApprovedServer = data.hasApprovedServer;
        hasApprovedAllUrls = data.hasApprovedAllUrls;
        console.log("load_data canLogin", isAbleToLogin);
        //Appid is a selection? maybe should just be a free text box
        //Need to login to get the list of apps

        if (hasApprovedServer) {
          document.getElementById("appId").disabled = false;
          await canLogin(url, username, password);
          await addApps(url, username, password, appId, appInternalId);
        }

        hasApprovedContinuousEval = data.hasApprovedContinuousEval;
        console.log("ContinuousEval", hasApprovedContinuousEval);
        document.getElementById(
          "ContinuousEval"
        ).checked = hasApprovedContinuousEval;

        //hasApprovedAllUrls
        hasApprovedAllUrls = data.hasApprovedAllUrls;
        console.log("hasApprovedAllUrls", hasApprovedAllUrls);
        document.getElementById("AllUrls").checked = hasApprovedAllUrls;
      }
    }
  );
};
function CheckIsOriginalOrigins(urlHref) {
  let installedPermissions = GetSettings("installedPermissions");
  let found = false;
  for (const origin in installedPermissions.origins) {
    if (object.hasOwnProperty(origin)) {
      const element = object[origin];
      if (element === urlHref) {
        //we are not deleting this
        found = true;
      }
    }
  }
  return found;
}
