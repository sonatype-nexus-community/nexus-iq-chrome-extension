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

import 'node-window-polyfill/register' // New line ensures this Polyfill is first!

// import {
//   ComponentDetails
// } from '@sonatype/js-sona-types';
// import localforage from 'localforage';
// import {PackageURL} from 'packageurl-js';
import { logger, LogLevel } from './logger/Logger'
import { findRepoType } from './utils/UrlParsing'

import {
    MESSAGE_REQUEST_TYPE,
    MESSAGE_RESPONSE_STATUS,
    MessageRequest,
    MessageResponse,
    MessageResponseFunction,
} from './types/Message'
import {
    requestComponentEvaluationByPurls,
    getApplications,
    pollForComponentEvaluationResult,
} from './messages/IqMessages'
import {
    ApiComponentEvaluationRequestDTOV2,
    ApiComponentEvaluationResultDTOV2,
    ApiComponentEvaluationTicketDTOV2,
} from '@sonatype/nexus-iq-api-client'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser

// const handleURLOSSIndex = (purl: string, settings: Settings): Promise<ComponentDetails> => {
//   const manifestData = chrome.runtime.getManifest();
//   return new Promise((resolve, reject) => {
//     const requestService = new OSSIndexRequestService(
//       {
//         token: settings.token as unknown as string,
//         browser: true,
//         user: settings.user as unknown as string,
//         application: settings.application as unknown as string,
//         logger: logger,
//         product: manifestData.name,
//         version: manifestData.version
//       },
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       localforage as any
//     );

//     const purlObj = PackageURL.fromString(purl);

//     requestService
//       .getComponentDetails([purlObj])
//       .then((componentDetails) => {
//         resolve(componentDetails);
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };

// const handleOSSIndexWrapper = (purl: string, settings: Settings) => {
//   handleURLOSSIndex(purl, settings)
//     .then((componentDetails) => {
//       logger.logMessage('Got back response from OSS Index', LogLevel.INFO);
//       logger.logMessage('Response from OSS Index', LogLevel.TRACE, componentDetails);
//       sendNotificationAndMessage(purl, componentDetails);
//     })
//     .catch((err) => {
//       logger.logMessage('Error: Unable to handle OSS Index wrapper', LogLevel.ERROR, err.message);
//       throw new Error(err);
//     });
// };

// const sendNotificationAndMessage = (purl: string, details: ComponentDetails) => {
//   if (
//     // details.componentDetails &&
//     details.componentDetails.length > 0 &&
//     details.componentDetails[0].securityData !== undefined &&
//     details.componentDetails[0].securityData !== null &&
//     // details.componentDetails[0].securityData.securityIssues &&
//     details.componentDetails[0].securityData.securityIssues?.length > 0
//   ) {
//     getActiveTabId()
//       .then((tabId) => {
//         chrome.action.setIcon({tabId: tabId, path: '/images/sonatype-lifecycle-icon_Vulnerable.png'});
//       })
//       .catch((err) => {
//         logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
//       });

//     logger.logMessage('Sending notification that component is vulnerable', LogLevel.INFO);
//     chrome.notifications.create(
//       {
//         title: `Sonatype Scan Results - ${purl}`,
//         iconUrl: '/images/sonatype-lifecycle-icon_Vulnerable.png',
//         type: 'basic',
//         message: 'Vulnerabilities have been found in this version',
//         priority: 1,
//         buttons: [
//           {
//             title: 'Close'
//           }
//         ],
//         isClickable: true
//       },
//       (notificationId) => {
//         logger.logMessage('Notification sent', LogLevel.TRACE, notificationId);
//       }
//     );
//   } else {
//     getActiveTabId()
//       .then((tabId) => {
//         chrome.action.setIcon({
//           tabId: tabId,
//           path: '/images/sonatype-lifecycle-icon-white-32x32.png'
//         });
//       })
//       .catch((err) => {
//         logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
//       });
//   }

//   getActiveTabId()
//     .then((tabId) => {
//       chrome.tabs.sendMessage(tabId, {
//         type: 'artifactDetailsFromServiceWorker',
//         componentDetails: details
//       }, (response) => {
//         if (chrome.runtime.lastError) {
//           console.error('Error in getActiveTabId 1')
//         }
//       });
//     })
//     .catch((err) => {
//       logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
//     });
// };

// const getActiveTabId = (): Promise<number> => {
//   return new Promise((resolve, reject) => {
//     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//       if (chrome.runtime.lastError) {
//         console.error('Error in getActiveTabId 2')
//       }

//       const tab = tabs.length > 0 ? tabs[0] : undefined;
//       const tabId = tab?.id !== undefined ? tab.id : undefined;
//       if (tab !== undefined && tabId !== undefined) {
//         resolve(tabId);
//       } else {
//         reject('No valid tab');
//       }
//     });
//   });
// };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   logger.logMessage('Request received', LogLevel.INFO, request);
//   console.info('Message received: ', request);

//   // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
//   if (request && request.type) {
//     if (request.type === 'getArtifactDetailsFromPurl') {
//       logger.logMessage('Getting settings in getArtifactDetailsFromPurl', LogLevel.INFO);
//       console.info('Getting settings in getArtifactDetailsFromPurl');
//       getSettings()
//         .then((settings: Settings) => {
//           // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
//           if (!settings.host || !settings.application || !settings.scanType || !settings.user || !settings.token ) {
//             console.error('Unable to get settings need to make IQ connection: ', settings);
//           }
//           if (settings.logLevel) {
//             logger.setLevel(settings.logLevel as unknown as LogLevel);
//           }
//           try {
//             if ((settings.scanType as unknown as string) === 'NEXUSIQ') {
//               logger.logMessage('Attempting to call Nexus IQ Server', LogLevel.INFO);
//               handleIQServerWrapper(request.purl, settings);
//             } else {
//               logger.logMessage('Attempting to call OSS Index', LogLevel.INFO);
//               handleOSSIndexWrapper(request.purl, settings);
//             }
//           } catch (err) {
//             logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
//             console.error('Error encountered in getArtifactDetailsFromPurl', err.message);

//           }
//         })
//         .catch((err) => {
//           logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
//           console.error('Error encountered in getArtifactDetailsFromPurl', err.message);
//         });
//     }
//     if (request.type === 'togglePage') {
//       toggleIcon(request.show);
//     }
//   }
// });

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
function handle_message_received(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender | browser.runtime.MessageSender,
    sendResponse: MessageResponseFunction
): boolean {
    logger.logMessage('Service Worker - Handle Received Message', LogLevel.INFO, request.type)

    switch (request.type) {
        case MESSAGE_REQUEST_TYPE.GET_APPLICATIONS:
            getApplications(request).then((response) => {
                sendResponse(response)
            })
            break
        case MESSAGE_REQUEST_TYPE.REQUEST_COMPONENT_EVALUATION_BY_PURLS:
            requestComponentEvaluationByPurls(request).then((response) => {
                logger.logMessage(`Response to Poll for Results: ${response}`, LogLevel.DEBUG)
                sendResponse(response)
            })
            break
    }

    return true
}

/**
 * Handler for Install Event for our Extension
 */
_browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        _browser.tabs.create({ url: 'options.html?install' }, (tab) => {
            if (chrome.runtime.lastError || browser.runtime.lastError) {
                console.error('Error in install handler opening tab')
            }
        })
    }
})

function enableDisableExtensionForUrl(url: string, tabId: number): void {
    /**
     * Check if URL matches an ecosystem we support, and only then do something
     *
     */
    const repoType = findRepoType(url)

    /**
     * Make sure we get a valid PURL before we ENABLE - this may require DOM access (via Message)
     */

    if (repoType !== undefined) {
        // We support this Repository!
        logger.logMessage(`Enabling Sonatype Browser Extension for ${url}`, LogLevel.DEBUG)
        _browser.tabs.sendMessage(
            tabId,
            {
                type: MESSAGE_REQUEST_TYPE.CALCULATE_PURL_FOR_PAGE,
                params: {
                    tabId: tabId,
                    url: url,
                },
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error('ERROR in here', chrome.runtime.lastError.message, response)
                }
                logger.logMessage('Calc Purl Response: ', LogLevel.INFO, response)
                if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
                    _browser.action.enable(tabId, () => {
                        chrome.action.setIcon({
                            tabId: tabId,
                            path: '/images/sonatype-lifecycle-icon-white-32x32.png',
                        })
                    })
                    console.log('Sonatype Extension ENABLED for ', url, response.data.purl)
                    /**
                     * @todo Get the policy/security threat level and update the
                     */
                } else {
                    logger.logMessage(
                        `Disabling Sonatype Browser Extension for ${url} - Could not determine PURL.`,
                        LogLevel.DEBUG
                    )
                    chrome.action.disable(tabId, () => {
                        /**
                         * @todo Change Extension ICON
                         */
                        console.log('Sonatype Extension DISABLED for ', url)
                    })
                }
            }
        )
    } else {
        logger.logMessage(`Disabling Sonatype Browser Extension for ${url} - Not a supported Registry.`, LogLevel.DEBUG)
        chrome.action.disable(tabId, () => {
            /**
             * @todo Change Extension ICON
             */
            console.log('Sonatype Extension DISABLED for ', url)
        })
    }
}

/**
 * Fired when the current tab changes, but the tab may itself not change
 */
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
    chrome.tabs.get(tabId, (tab) => {
        if (tab.url !== undefined) {
            enableDisableExtensionForUrl(tab.url, tabId)
        }
    })
})

/**
 * This is fired for every tab on every update - we should filter before sending a message - this is carnage!
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete' && tab.active && tab.url !== undefined) {
        enableDisableExtensionForUrl(tab.url, tabId)
    }
})
