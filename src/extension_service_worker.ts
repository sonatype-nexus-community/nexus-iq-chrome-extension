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

const NEXUS_IQ_BROWSER_EXTENSION_INSTALL_TIME = 'nexusIqBrowserExtensionInstallTime';
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

const installNotice = async () => {
  // TODO: figure out how to abstract this for Firefox (hopefully it just works)
  _browser.storage.local.get(
    NEXUS_IQ_BROWSER_EXTENSION_INSTALL_TIME,
    (items: {[key: string]: any}) => {
      console.trace(items[NEXUS_IQ_BROWSER_EXTENSION_INSTALL_TIME]);

      if (items[NEXUS_IQ_BROWSER_EXTENSION_INSTALL_TIME]) return;

      const now = new Date().getTime();
      _browser.storage.local.set(
        {[NEXUS_IQ_BROWSER_EXTENSION_INSTALL_TIME]: now.toString()},
        () => {
          console.debug('Set install time', now);
          console.debug('Attempting to open options');
          _browser.tabs.create({url: 'options.html'});
        }
      );
    }
  );
};

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
  return new Promise((resolve, reject) => {
    const requestService = new OSSIndexRequestService(
      {
        token: settings.token,
        browser: true,
        user: settings.user,
        application: settings.application,
        logger: new TestLogger(),
        product: 'nexus-iq-chrome-extension',
        version: '1.0.0'
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
  return new Promise((resolve) => {
    const requestService = new IqRequestService({
      host: settings.host,
      token: settings.token,
      browser: true,
      user: settings.user,
      application: settings.application,
      logger: new TestLogger(),
      product: 'nexus-iq-chrome-extension',
      version: '1.0.0'
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
    details.componentDetails[0].securityData.securityIssues
  ) {
    chrome.notifications.create({
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
    });
  }

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'artifactDetailsFromServiceWorker',
        componentDetails: details
      });
    }
  });
};

const handleIQServerWrapper = (purl: string, settings: Settings) => {
  if (settings.host && settings.token && settings.application && settings.user) {
    console.debug('Attempting to call Nexus IQ Server');

    handleURLIQServer(purl, settings).then((componentDetails) => {
      console.debug('Got back response from Nexus IQ Server');
      console.trace(componentDetails);

      sendNotificationAndMessage(purl, componentDetails);
    });
  } else {
    throw new Error('Unable to call Nexus IQ Server');
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'pkgs.alpinelinux.org',
              schemes: ['https'],
              pathContains: 'package'
            }
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'www.npmjs.com',
              schemes: ['https'],
              pathContains: 'package'
            }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.trace(request);

  if (request && request.type && request.type === 'getArtifactDetailsFromPurl') {
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
});

installNotice();
