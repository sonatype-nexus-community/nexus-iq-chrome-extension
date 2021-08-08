/*
 * Copyright (c) 2019-present Sonatype, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference lib="webworker" />

import 'node-window-polyfill/register';
import {IqRequestService, OSSIndexRequestService, TestLogger} from '@sonatype/js-sona-types';
import {PackageURL} from 'packageurl-js';
import localforage from 'localforage';

const _browser: any = chrome ? chrome : browser;

const SCAN_TYPE = 'scanType';
const IQ_SERVER_URL = 'iqServerURL';
const IQ_SERVER_APPLICATION = 'iqServerApplication';
const IQ_SERVER_USER = 'iqServerUser';
const IQ_SERVER_TOKEN = 'iqServerToken';

interface Settings {
  scanType: string | undefined;
  host: string | undefined;
  user: string | undefined;
  token: string | undefined;
  application: string | undefined;
}

const getSettings = async (): Promise<Settings> => {
  const promise = new Promise<Settings>((resolve) => {
    _browser.storage.local.get(
      [SCAN_TYPE, IQ_SERVER_URL, IQ_SERVER_USER, IQ_SERVER_TOKEN, IQ_SERVER_APPLICATION],
      (items: {[key: string]: any}) => {
        resolve({
          scanType: items[SCAN_TYPE],
          host: items[IQ_SERVER_URL],
          user: items[IQ_SERVER_USER],
          token: items[IQ_SERVER_TOKEN],
          application: items[IQ_SERVER_APPLICATION]
        });
      }
    );
  });
  return await promise;
};

const handleURLOSSIndex = (purl: string, settings: Settings): Promise<any> => {
  const manifestData = chrome.runtime.getManifest();
  return new Promise((resolve, reject) => {
    const requestService = new OSSIndexRequestService(
      {
        token: settings.token,
        browser: true,
        user: settings.user,
        application: settings.application,
        logger: new TestLogger(),
        product: manifestData.name,
        version: manifestData.version
      },
      localforage as any
    );

    const purlObj = PackageURL.fromString(purl);

    requestService
      .getComponentDetails([purlObj])
      .then((componentDetails) => {
        resolve(componentDetails);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const handleURLIQServer = (purl: string, settings: Settings): Promise<any> => {
  const manifestData = chrome.runtime.getManifest();
  return new Promise((resolve) => {
    const requestService = new IqRequestService({
      host: settings.host,
      token: settings.token,
      browser: true,
      user: settings.user,
      application: settings.application,
      logger: new TestLogger(),
      product: manifestData.name,
      version: manifestData.version
    });

    requestService
      .loginViaRest()
      .then((loggedIn) => {
        if (loggedIn) {
          console.debug('Logged in to Nexus IQ Server via service worker');
          _doRequestToIQServer(requestService, purl)
            .then((res) => {
              resolve(res);
            })
            .catch((err) => {
              throw new Error(err);
            });
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  });
};

const _doRequestToIQServer = (requestService: IqRequestService, purl: string): Promise<any> => {
  return new Promise((resolve) => {
    chrome.cookies.getAll({name: 'CLM-CSRF-TOKEN'}, (cookies) => {
      if (cookies && cookies.length > 0) {
        requestService.setXCSRFToken(cookies[0].value);
      }

      const purlObj = PackageURL.fromString(purl);
      requestService
        .getComponentDetails([purlObj])
        .then((details) => {
          resolve(details);
        })
        .catch((err) => {
          throw new Error(err);
        });
    });
  });
};

const handleOSSIndexWrapper = (purl: string, settings: Settings) => {
  handleURLOSSIndex(purl, settings)
    .then((componentDetails) => {
      console.debug('Got back response from OSS Index');
      console.trace(componentDetails);

      sendNotificationAndMessage(purl, componentDetails);
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const sendNotificationAndMessage = (purl: string, details: any) => {
  if (
    details.componentDetails &&
    details.componentDetails.length > 0 &&
    details.componentDetails[0].securityData &&
    details.componentDetails[0].securityData.securityIssues &&
    details.componentDetails[0].securityData.securityIssues.length > 0
  ) {
    getActiveTabId()
      .then((tabId) => {
        chrome.action.setIcon({tabId: tabId, path: '/images/SON_logo_favicon_Vulnerable.png'});
      })
      .catch((err) => {
        console.error(err);
      });

    console.debug('Sending notification that component is vulnerable');
    chrome.notifications.create(
      {
        title: `Sonatype Scan Results - ${purl}`,
        iconUrl: '/images/SON_logo_favicon_Vulnerable.png',
        type: 'basic',
        message: 'Vulnerabilities have been found in this version',
        priority: 1,
        buttons: [
          {
            title: 'Close'
          }
        ],
        isClickable: true
      },
      (notificationId) => {
        console.trace('Notification sent: ' + notificationId);
      }
    );
  } else {
    getActiveTabId()
      .then((tabId) => {
        chrome.action.setIcon({tabId: tabId, path: '/images/SON_logo_favicon_not_vuln.png'});
      })
      .catch((err) => {
        console.error(err);
      });
  }

  getActiveTabId()
    .then((tabId) => {
      chrome.tabs.sendMessage(tabId, {
        type: 'artifactDetailsFromServiceWorker',
        componentDetails: details
      });
    })
    .catch((err) => {
      console.error(err);
    });
};

const getActiveTabId = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs && tabs.length > 0 && tabs[0].id) {
        resolve(tabs[0].id);
      } else {
        reject('No valid tab');
      }
    });
  });
};

const toggleIcon = (show: boolean) => {
  try {
    getActiveTabId()
      .then((tabId) => {
        if (show) {
          chrome.action.enable(tabId);
        } else {
          chrome.action.disable(tabId);
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    console.error(err);
  }
};

const handleIQServerWrapper = (purl: string, settings: Settings) => {
  if (settings.host && settings.token && settings.application && settings.user) {
    console.debug('Attempting to call Nexus IQ Server', purl, settings);

    handleURLIQServer(purl, settings).then((componentDetails) => {
      console.debug('Got back response from Nexus IQ Server');
      console.trace(componentDetails);

      sendNotificationAndMessage(purl, componentDetails);
    });
  } else {
    throw new Error('Unable to call Nexus IQ Server');
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.trace(request);

  if (request && request.type) {
    if (request.type === 'getArtifactDetailsFromPurl') {
      console.debug('Getting settings');
      getSettings()
        .then((settings: Settings) => {
          try {
            if (settings.scanType === 'OSSINDEX') {
              console.debug('Attempting to call OSS Index');
              handleOSSIndexWrapper(request.purl, settings);
            } else {
              console.debug('Attempting to call Nexus IQ Server');
              handleIQServerWrapper(request.purl, settings);
            }
          } catch (err) {
            console.error(err);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
    if (request.type === 'togglePage') {
      toggleIcon(request.show);
    }
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({url: 'options.html?install'});
  } else if (details.reason === 'update') {
  } else if (details.reason === 'chrome_update') {
  } else if (details.reason === 'shared_module_update') {
  }
});
