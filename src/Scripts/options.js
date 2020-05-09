/*jslint es6  -W024 */
// import * as utils from "./utils.js";
const cookieName = "CLM-CSRF-TOKEN";
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
};

const message = async (strMessage) => {
  let msg = document.getElementById("error");
  msg.innerHTML = strMessage;
};

const saveForm = async () => {
  var url = document.getElementById("url").value;
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var app = document.getElementById("appId").value;
  let hasApprovedContinuousEval = document.getElementById("ContinuousEval")
    .checked;
  console.log("hasApprovedContinuousEval", hasApprovedContinuousEval);
  // console.log(url);
  // console.log(username);
  // console.log(password);
  if (url === "" || username === "" || password === "" || app === "") {
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

  var ok = true;
  if (ok) {
    message("Saved Values");

    // window.close();
  }
  // load_data();
};
const setSettings = async (obj) => {
  console.log(Object.values(obj)[0]);
  await chrome.storage.sync.set(
    { [Object.keys(obj)[0]]: Object.values(obj)[0] },
    async () => {
      //alert('saved'+ value);
      console.log("Saved obj", obj);
    }
  );
};
const ContinuousEval = async (isChecked) => {
  if (isChecked) {
    //add the Tabs permission
    chrome.permissions.request(
      {
        permissions: ["tabs", "notifications"],
      },
      (granted) => {
        console.log("requesting");
        setSettings({ hasApprovedContinuousEval: isChecked });
      }
    );
  } else {
    //remove the Tabs permission
    chrome.permissions.remove(
      {
        permissions: ["tabs", "notifications"],
      },
      () => {
        console.log("removing");
        setSettings({
          hasApprovedContinuousEval: isChecked,
        });
      }
    );
  }
};

const checkPermissions = async (url) => {
  chrome.permissions.contains(
    {
      permissions: ["tabs"],
      origins: [url],
    },
    (result) => {
      if (result) {
        // The extension has the permissions.
      } else {
        // The extension doesn't have the permissions.
      }
    }
  );
};

const loginUser = async () => {
  console.log("login");
  var url = document.getElementById("url").value;
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  if (url === "" || username === "" || password === "") {
    message("Please provide IQ Server, Username and Password");
  } else {
    let app = document.getElementById("appId").value;
    let appValues = app.split(" ");
    let appInternalId = appValues[0];
    let appId = appValues[1];
    await addPerms(url, username, password, appId, appInternalId);
  }
};
const addPerms = async (url, username, password, appId, appInternalId) => {
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
          { url: url, name: cookieName },
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
const canLogin = async (url, username, password) => {
  console.log("canLogin", url, username, password);
  message("");
  let baseURL = url + (url.substr(-1) === "/" ? "" : "/");
  let urlEndPoint = baseURL + "rest/user/session";
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
      //can I get the cookie here
      // let name = "CLM-CSRF-TOKEN";
      // let cookie = GetCookieFromURL(url, name);
      // console.log("Cookie in login", cookie);
      return true;
    })
    .catch((error) => {
      console.error(error);
      message(error);
      return false;
    });
  return;
};

const GetCookieFromURL = async (url, name) => {
  await chrome.cookies.get({ url: url, name: name }, async (cookie) => {
    console.log("cookie", cookie);
    return cookie;
  });
};
const StoreCookieInStorage = async (cookie) => {
  await chrome.storage.sync.set({ IQCookie: cookie }, async () => {
    //alert('saved'+ value);
    console.log("Saved cookie.value", cookie);
  });
};

const addApps = async (url, username, password, appId, appInternalId) => {
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

const load_data = async () => {
  console.log("load_data");
  let isAbleToLogin = true;
  let url, username, password, appId, appInternalId;
  let hasApprovedServer;
  let hasApprovedContinuousEval;
  chrome.storage.sync.get(
    [
      "url",
      "username",
      "password",
      "appId",
      "appInternalId",
      "hasApprovedServer",
      "hasApprovedContinuousEval",
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
        console.log("load_data canLogin", isAbleToLogin);
        //Appid is a selection? maybe should just be a free text box
        //Need to login to get the list of apps

        if (hasApprovedServer) {
          document.getElementById("appId").disabled = false;
          // addPerms(url);
          canLogin(url, username, password);
          addApps(url, username, password, appId, appInternalId);
          // document.getElementById("appId").selectedIndex = i;
          //document.getElementById("appId").selected = appId;
          // $("#appId").val(appInternalId + " " + appId);
        }

        hasApprovedContinuousEval = data.hasApprovedContinuousEval;

        console.log("ContinuousEval", hasApprovedContinuousEval);
        document.getElementById(
          "ContinuousEval"
        ).checked = hasApprovedContinuousEval;
      }
    }
  );
};
