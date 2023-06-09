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

import 'node-window-polyfill/register'; // New line ensures this Polyfill is first!

import {
  ComponentDetails,
  IqRequestService,
  LogLevel,
  OSSIndexRequestService
} from '@sonatype/js-sona-types';
import localforage from 'localforage';
import {PackageURL} from 'packageurl-js';
import { BrowserExtensionLogger } from './logger/Logger';

import { MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS, MessageRequest, MessageResponse, MessageResponseFunction } from './types/Message'
import { getApplications } from './messages/IqMessages'
import { 
  getSettings as getExtensionSettings,
  updateSettings as updateExtensionSettings 
} from './messages/SettingsMessages'
import { DATA_SOURCE } from './utils/Constants';

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser;

const logger = new BrowserExtensionLogger(LogLevel.TRACE);

const SCAN_TYPE = 'scanType';
const IQ_SERVER_URL = 'iqServerURL';
const IQ_SERVER_APPLICATION = 'iqServerApplication';
const IQ_SERVER_USER = 'iqServerUser';
const IQ_SERVER_TOKEN = 'iqServerToken';
const LOG_LEVEL = 'logLevel';

interface Settings {
  scanType: Settings | undefined;
  host: Settings | undefined;
  user: Settings | undefined;
  token: Settings | undefined;
  application: Settings | undefined;
  logLevel: Settings | undefined;
}

const getSettings = async (): Promise<Settings> => {
  console.log("getSettings in extension_service_worker");
  const promise = new Promise<Settings>((resolve) => {
    _browser.storage.local.get(
      [SCAN_TYPE, IQ_SERVER_URL, IQ_SERVER_USER, IQ_SERVER_TOKEN, IQ_SERVER_APPLICATION, LOG_LEVEL],
      (items: {[key: string]: Settings}) => {
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

const handleURLOSSIndex = (purl: string, settings: Settings): Promise<ComponentDetails> => {
  const manifestData = chrome.runtime.getManifest();
  return new Promise((resolve, reject) => {
    const requestService = new OSSIndexRequestService(
      {
        token: settings.token as unknown as string,
        browser: true,
        user: settings.user as unknown as string,
        application: settings.application as unknown as string,
        logger: logger,
        product: manifestData.name,
        version: manifestData.version
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const handleURLIQServer = (purl: string, settings: Settings): Promise<ComponentDetails> => {
  const manifestData = chrome.runtime.getManifest();
  return new Promise((resolve) => {
    const requestService = new IqRequestService({
      host: settings.host as unknown as string,
      token: settings.token as unknown as string,
      browser: true,
      user: settings.user as unknown as string,
      application: settings.application as unknown as string,
      logger: logger,
      product: manifestData.name,
      version: manifestData.version
    });

      requestService.loginViaRest()
      .then((loggedIn) => {
        if (loggedIn) {
          logger.logMessage('Logged in to Sonatype IQ Server via service worker', LogLevel.INFO);
          _doRequestToIQServer(requestService, purl)
            .then((res) => {
              resolve(res);
            })
            .catch((err) => {
              logger.logMessage('Unable to login to Sonatype IQ server via service worker', LogLevel.ERROR, err.message);
              console.error('Unable to login to Sonatype IQ server via service worker', err.message);
              throw new Error(err);
            });
        } else {
          console.error('Unable to login to Sonatype IQ server via service worker: ', settings);
        }
      })
      .catch((err) => {
        logger.logMessage('Error in requestService login', LogLevel.ERROR, err.message);
        throw new Error(err);
      });
  });
};

const setCSRFTokenCookie = async (host: string): Promise<string> => {
  console.info('setting csrf token cookie: ', host);
  return new Promise((resolve) => {
    chrome.cookies.set({
      url: host,
      name: 'CLM-CSRF-TOKEN',
      value: 'api'}, (success) => {
      console.log('Cookie set:', success);
      resolve('api');
    });
  });
};

const _doRequestToIQServer = (requestService: IqRequestService, purl: string): Promise<ComponentDetails> => {
  return new Promise((resolve) => {

    setCSRFTokenCookie(requestService.options.host as string)
        .then(async (token) => {
          requestService.setXCSRFToken(token);

    const purlObj = PackageURL.fromString(purl);

    requestService
      .getComponentDetails([purlObj])
      .then((details) => {
        resolve(details);
      })
      .catch((err) => {
        logger.logMessage('Error: Unable to complete request to IQ server', LogLevel.ERROR, err.message);
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
      logger.logMessage('Error: Unable to handle OSS Index wrapper', LogLevel.ERROR, err.message);
      throw new Error(err);
    });
};

const sendNotificationAndMessage = (purl: string, details: ComponentDetails) => {
  if (
    // details.componentDetails &&
    details.componentDetails.length > 0 &&
    details.componentDetails[0].securityData !== undefined &&
    details.componentDetails[0].securityData !== null &&
    // details.componentDetails[0].securityData.securityIssues &&
    details.componentDetails[0].securityData.securityIssues?.length > 0
  ) {
    getActiveTabId()
      .then((tabId) => {
        chrome.action.setIcon({tabId: tabId, path: '/images/sonatype-lifecycle-icon_Vulnerable.png'});
      })
      .catch((err) => {
        logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
      });

    logger.logMessage('Sending notification that component is vulnerable', LogLevel.INFO);
    chrome.notifications.create(
      {
        title: `Sonatype Scan Results - ${purl}`,
        iconUrl: '/images/sonatype-lifecycle-icon_Vulnerable.png',
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
        chrome.action.setIcon({
          tabId: tabId,
          path: '/images/sonatype-lifecycle-icon-white-32x32.png'
        });
      })
      .catch((err) => {
        logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
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
      logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
    });
};

const getActiveTabId = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs.length > 0 ? tabs[0] : undefined;
      const tabId = tab?.id !== undefined ? tab.id : undefined;
      if (tab !== undefined && tabId !== undefined) {
        resolve(tabId);
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
        logger.logMessage('Unable to get active tab id', LogLevel.ERROR, err.message);
        throw new Error(err);
      });
  } catch (err) {
    logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
  }
};

const handleIQServerWrapper = (purl: string, settings: Settings) => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  logger.logMessage('Request received', LogLevel.INFO, request);
  console.info('Message received: ', request);

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (request && request.type) {
    if (request.type === 'getArtifactDetailsFromPurl') {
      logger.logMessage('Getting settings in getArtifactDetailsFromPurl', LogLevel.INFO);
      console.info('Getting settings in getArtifactDetailsFromPurl');
      getSettings()
        .then((settings: Settings) => {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (!settings.host || !settings.application || !settings.scanType || !settings.user || !settings.token ) {
            console.error('Unable to get settings need to make IQ connection: ', settings);
          }
          if (settings.logLevel) {
            logger.setLevel(settings.logLevel as unknown as LogLevel);
          }
          try {
            if ((settings.scanType as unknown as string) === 'NEXUSIQ') {
              logger.logMessage('Attempting to call Nexus IQ Server', LogLevel.INFO);
              handleIQServerWrapper(request.purl, settings);
            } else {
              logger.logMessage('Attempting to call OSS Index', LogLevel.INFO);
              handleOSSIndexWrapper(request.purl, settings);
            }
          } catch (err) {
            logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
            console.error('Error encountered in getArtifactDetailsFromPurl', err.message);

          }
        })
        .catch((err) => {
          logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
          console.error('Error encountered in getArtifactDetailsFromPurl', err.message);
        });
    }
    if (request.type === 'togglePage') {
      toggleIcon(request.show);
    }
  }
});

/**
 * New listener for messages received by Service Worker.
 * 
 */
_browser.runtime.onMessage.addListener(handle_message_received)

/**
 * New (asynchronous) handler for processing messages received.
 * 
 * This always returns True to cause handling to be asynchronous.
 */
function handle_message_received(request: MessageRequest, sender: chrome.runtime.MessageSender | browser.runtime.MessageSender, sendResponse: MessageResponseFunction): boolean {
  console.debug('Service Worker - Handle Received Message', request.type)

  let response: MessageResponse = {
    "status": MESSAGE_RESPONSE_STATUS.UNKNOWN_ERROR,
    "status_detail": {
      "mesage": "Default Error"
    }
  }

  switch (request.type) {
    case MESSAGE_REQUEST_TYPE.GET_APPLICATIONS:
      response = getApplications(request)
      break
    case MESSAGE_REQUEST_TYPE.GET_SETTINGS:
      getExtensionSettings().then((response) => {
        response.status_detail = {
          'message': "Proving this is where the response comes from!"
        }
        sendResponse(response)
      })
      break
    case MESSAGE_REQUEST_TYPE.UPDATE_SETTINGS:
      updateExtensionSettings(request)
      break
  }

  return true
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    /*
    Upon first installation, force some initial settings into Local Storage
    before we open the Options Tab.
     */
    updateExtensionSettings({
      "type": MESSAGE_REQUEST_TYPE.UPDATE_SETTINGS,
      "params": {
        "dataSource": DATA_SOURCE.NEXUSIQ,
        "logLevel": LogLevel.TRACE
      }
    }).then((response) => {
      chrome.tabs.create({url: 'options.html?install'})
    })
    
  } else if (details.reason === 'update') {
    /* empty */
  } else if (details.reason === 'chrome_update') {
    /* empty */
  } else if (details.reason === 'shared_module_update') {
    /* empty */
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url !== '') {
    chrome.tabs.sendMessage(tabId, {
      type: 'changedURLOnPage',
      url: changeInfo.url
    });
  }
});
