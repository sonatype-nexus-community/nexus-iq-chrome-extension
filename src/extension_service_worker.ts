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
import {IqRequestService, LogLevel, OSSIndexRequestService} from '@sonatype/js-sona-types';
import {PackageURL} from 'packageurl-js';
import BrowserExtensionLogger from './logger/Logger';
import localforage from 'localforage';

const _browser: any = chrome ? chrome : browser;

const logger = new BrowserExtensionLogger(LogLevel.ERROR);

const SCAN_TYPE = 'scanType';
const IQ_SERVER_URL = 'iqServerURL';
const IQ_SERVER_APPLICATION = 'iqServerApplication';
const IQ_SERVER_USER = 'iqServerUser';
const IQ_SERVER_TOKEN = 'iqServerToken';
const LOG_LEVEL = 'logLevel';

interface Settings {
  scanType: string | undefined;
  host: string | undefined;
  user: string | undefined;
  token: string | undefined;
  application: string | undefined;
  logLevel: number | undefined;
}

const getSettings = async (): Promise<Settings> => {
  const promise = new Promise<Settings>((resolve) => {
    _browser.storage.local.get(
      [SCAN_TYPE, IQ_SERVER_URL, IQ_SERVER_USER, IQ_SERVER_TOKEN, IQ_SERVER_APPLICATION, LOG_LEVEL],
      (items: {[key: string]: any}) => {
        resolve({
          scanType: items[SCAN_TYPE],
          host: items[IQ_SERVER_URL],
          user: items[IQ_SERVER_USER],
          token: items[IQ_SERVER_TOKEN],
          application: items[IQ_SERVER_APPLICATION],
          logLevel: items[LOG_LEVEL]
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
        logger: logger,
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
      logger: logger,
      product: manifestData.name,
      version: manifestData.version
    });

    requestService
      .loginViaRest()
      .then((loggedIn) => {
        if (loggedIn) {
          logger.logMessage('Logged in to Nexus IQ Server via service worker', LogLevel.INFO);
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
      logger.logMessage('Got back response from OSS Index', LogLevel.INFO);
      logger.logMessage('Response from OSS Index', LogLevel.TRACE, componentDetails);

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
        chrome.action.setIcon({tabId: tabId, path: '/images/NexusLifecycle_Vulnerable.png'});
      })
      .catch((err) => {
        logger.logMessage('Error encountered', LogLevel.ERROR, err);
      });

    logger.logMessage('Sending notification that component is vulnerable', LogLevel.INFO);
    chrome.notifications.create(
      {
        title: `Sonatype Scan Results - ${purl}`,
        iconUrl: '/images/NexusLifecycle_Vulnerable.png',
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
        logger.logMessage('Notification sent', LogLevel.TRACE, notificationId);
      }
    );
  } else {
    getActiveTabId()
      .then((tabId) => {
        chrome.action.setIcon({tabId: tabId, path: '/images/NexusLifecycle_Icon-32x32.png'});
      })
      .catch((err) => {
        logger.logMessage('Error encountered', LogLevel.ERROR, err);
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
      logger.logMessage('Error encountered', LogLevel.ERROR, err);
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
    logger.logMessage('Error encountered', LogLevel.ERROR, err);
  }
};

const handleIQServerWrapper = (purl: string, settings: Settings) => {
  if (settings.host && settings.token && settings.application && settings.user) {
    logger.logMessage('Attempting to call Nexus IQ Server', LogLevel.INFO);

    handleURLIQServer(purl, settings).then((componentDetails) => {
      logger.logMessage('Got back response from Nexus IQ Server', LogLevel.INFO);
      logger.logMessage('Got back component details', LogLevel.TRACE, componentDetails);

      sendNotificationAndMessage(purl, componentDetails);
    });
  } else {
    throw new Error('Unable to call Nexus IQ Server');
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  logger.logMessage('Request recieved', LogLevel.INFO, request);

  if (request && request.type) {
    if (request.type === 'getArtifactDetailsFromPurl') {
      logger.logMessage('Getting settings', LogLevel.INFO);
      getSettings()
        .then((settings: Settings) => {
          if (settings.logLevel) {
            logger.setLevel(settings.logLevel);
          }
          try {
            if (settings.scanType === 'NEXUSIQ') {
              logger.logMessage('Attempting to call Nexus IQ Server', LogLevel.INFO);
              handleIQServerWrapper(request.purl, settings);
            } else {
              logger.logMessage('Attempting to call OSS Index', LogLevel.INFO);
              handleOSSIndexWrapper(request.purl, settings);
            }
          } catch (err) {
            logger.logMessage('Error encountered', LogLevel.ERROR, err);
          }
        })
        .catch((err) => {
          logger.logMessage('Error encountered', LogLevel.ERROR, err);
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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, {
      type: 'changedURLOnPage',
      url: changeInfo.url
    });
  }
});
