/// <reference lib="webworker" />

import 'node-window-polyfill/register';
import {IqRequestService, TestLogger} from '@sonatype/js-sona-types';
import {PackageURL} from 'packageurl-js';

const _browser: any = chrome ? chrome : browser;

interface Settings {
  scanType: string | undefined;
  host: string | undefined;
  user: string | undefined;
  token: string | undefined;
  application: string | undefined;
}

const installNotice = async () => {
  // TODO: figure out how to abstract this for Firefox (hopefully it just works)
  _browser.storage.local.get('nexusIqBrowserExtensionInstallTime', (items: {[key: string]: any}) => {
    console.log(items['nexusIqBrowserExtensionInstallTime']);

    if (items['nexusIqBrowserExtensionInstallTime']) return;

    const now = new Date().getTime();
    _browser.storage.local.set({['nexusIqBrowserExtensionInstallTime']: now.toString()}, () => {
      console.log('Set install time', now);
      console.log('Attempting to open options');
      _browser.tabs.create({url: 'options.html'});
    });
  });
};

const getSettings = async (): Promise<Settings> => {
  const promise = new Promise<Settings>((resolve) => {
    _browser.storage.local.get(
      ['scanType', 'iqServerURL', 'iqServerUser', 'iqServerToken', `iqServerApplication`],
      (items: {[key: string]: any}) => {
        resolve({
          scanType: items['scanType'],
          host: items['iqServerURL'],
          user: items['iqServerUser'],
          token: items['iqServerToken'],
          application: items['iqServerApplication']
        });
      }
    );
  });
  return await promise;
};

const handleURLOSSIndex = (url: string) => {
  console.log('OSS Index');
};

const handleURLIQServer = (purl: string, settings: Settings): Promise<any> => {
  return new Promise((resolve, reject) => {
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
          console.log('Logged in to Nexus IQ Server via service worker');
          _doRequestToIQServer(requestService, purl)
            .then((res) => {
              resolve(res);
            })
            .catch((err) => {
              console.error(err);
              reject();
            });
        }
      })
      .catch((err) => {
        console.error(err);
        reject();
      });
  });
};

const _doRequestToIQServer = (requestService: IqRequestService, purl: string): Promise<any> => {
  return new Promise((resolve, reject) => {
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
          console.error(err);
          reject();
        });
    });
  });
};

const handleIQServerWrapper = async (purl: string, settings: Settings) => {
  if (settings.host && settings.token && settings.application && settings.user) {
    console.log('Attempting to call Nexus IQ Server');

    handleURLIQServer(purl, settings).then((details) => {
      console.log('Got back response from Nexus IQ Server');
      console.log(details);

      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'artifactDetailsFromServiceWorker',
            componentDetails: details
          });
        }
      });
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
  console.log(request);

  if (request && request.type && request.type === 'getArtifactDetailsFromPurl') {
    console.debug('Getting settings');
    getSettings()
      .then((settings: Settings) => {
        try {
          if (settings.scanType === 'OSSINDEX') {
            console.debug('Attempting to call OSS Index');
            handleURLOSSIndex(request.purl);
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
