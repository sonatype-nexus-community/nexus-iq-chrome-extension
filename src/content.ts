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

// import {ComponentDetails} from '@sonatype/js-sona-types'
import $, { Cash } from 'cash-dom'
// import {ArtifactMessage} from './types/ArtifactMessage'
import { getArtifactDetailsFromDOM } from './utils/PageParsing'
import { findRepoType } from './utils/UrlParsing'
// import { RepoType } from './utils/Constants'
import { MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS, MessageRequest, MessageResponseFunction } from './types/Message'
import { logger, LogLevel } from './logger/Logger'
import { ComponentState } from './types/Component'
import { RepoType } from './utils/Constants'
import { dom } from '@fortawesome/fontawesome-svg-core'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser

/**
 * New listener for messages received by Service Worker.
 *
 */
_browser.runtime.onMessage.addListener(handle_message_received_calculate_purl_for_page)
_browser.runtime.onMessage.addListener(handle_message_received_propogate_component_state)

/**
 * New (asynchronous) handler for processing messages received.
 *
 * This always returns True to cause handling to be asynchronous.
 */
function handle_message_received_calculate_purl_for_page(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender | browser.runtime.MessageSender,
    sendResponse: MessageResponseFunction
): boolean {
    if (request.type == MESSAGE_REQUEST_TYPE.CALCULATE_PURL_FOR_PAGE) {
        logger.logMessage('Content Script - Handle Received Message', LogLevel.INFO, request.type)
        logger.logMessage('Deriving PackageURL', LogLevel.INFO, request.params)
        const repoType = findRepoType(window.location.href)

        if (repoType === undefined) {
            sendResponse({
                status: MESSAGE_RESPONSE_STATUS.FAILURE,
                status_detail: {
                    message: `Repository not supported: ${window.location.href}`,
                },
            })
        } else {
            const purl = getArtifactDetailsFromDOM(repoType, window.location.href)
            if (purl === undefined) {
                sendResponse({
                    status: MESSAGE_RESPONSE_STATUS.FAILURE,
                    status_detail: {
                        message: `Unable to determine PackageURL for ${request.params}`,
                    },
                })
            } else {
                sendResponse({
                    status: MESSAGE_RESPONSE_STATUS.SUCCESS,
                    data: {
                        purl: purl.toString(),
                    },
                })
            }
        }
    }

    return true
}

/**
 * New (asynchronous) handler for processing messages received.
 *
 * This always returns True to cause handling to be asynchronous.
 */
function handle_message_received_propogate_component_state(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender | browser.runtime.MessageSender,
    sendResponse: MessageResponseFunction
): void {
    if (request.type == MESSAGE_REQUEST_TYPE.PROPOGATE_COMPONENT_STATE) {
        logger.logMessage('Content Script - Handle Received Message', LogLevel.INFO, request.type)
        if (request.params !== undefined && 'componentState' in request.params) {
            logger.logMessage('Adding CSS Classes', LogLevel.DEBUG)
            const repoType = findRepoType(window.location.href) as RepoType
            const componentState = request.params.componentState as ComponentState
            let vulnClass = 'sonatype-iq-extension-vuln-none'
            switch (componentState) {
                case ComponentState.CRITICAL:
                    vulnClass = 'sonatype-iq-extension-vuln-severe'
                    break
                case ComponentState.SEVERE:
                    vulnClass = 'sonatype-iq-extension-vuln-high'
                    break
                case ComponentState.MODERATE:
                    vulnClass = 'sonatype-iq-extension-vuln-med'
                    break
                case ComponentState.LOW:
                    vulnClass = 'sonatype-iq-extension-vuln-low'
                    break
            }

            const domElement = $(repoType.titleSelector)
            if (domElement.length > 0) {
                domElement.addClass(vulnClass)
                domElement.addClass('sonatype-iq-extension-vuln')
            }
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// chrome.runtime.onMessage.addListener((event: any, sender, respCallback) => {
//   console.info('Received a message on content.js', event);
//   if (event.type === 'changedURLOnPage') {
//     console.debug('Received changedURLOnPage message on content.js');
//     checkPage();
//   }

//   if (event.type === 'getArtifactDetailsFromWebpage') {
//     console.info('Received getArtifactDetailsFromWebpage message on content.js');
//     const data: ArtifactMessage = event;
//     const repoType = data.repoTypeInfo;
//     console.info('Message says to get some artifact details from the webpage, will do boss!', data);

//     const purl = getArtifactDetailsFromDOM(data.repoTypeInfo, data.url);

//     if (purl) {
//       console.debug('Obtained a valid purl from getArtifactDetailsFromDOM: ' + purl);
//       respCallback(purl.toString());
//     } else {
//       const version = findVersionElement(repoType) ?? '';
//       if (version.length > 0) {
//         // TODO: This needs to be handled for the different pacakge formats
//         const oldUrl = window.location.href.endsWith('/') ? window.location.href.slice(0, -1) : window.location.href;
//         const newUrl = oldUrl + (repoType.appendVersionPath?.replace("{versionNumber}", version));
//         const newPurl = getArtifactDetailsFromDOM(repoType, newUrl);
//         if (newPurl) {
//           console.debug('Obtained a valid purl and retrying getArtifactDetailsFromPurl : ' + purl);
//           respCallback(newPurl.toString());
//         }
//       }
//     }
//     // if (purl) {
//     //   console.info('Got a purl back from scraping url or webpage', purl);
//     //   respCallback(purl.toString());
//     // }
//   }

//   if (event.type === 'artifactDetailsFromServiceWorker') {
//     // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
//     if (event.componentDetails) {
//       const data: ComponentDetails = event.componentDetails;
//       // const policyData: PolicyData = event.policyData;
//       //
//       // console.log('Policy Details', policyData);
//       const loc = window.location.href;
//       const element = findElement(loc);
//       removeClasses(element);
//       if (
//         // data.componentDetails[0] &&
//         data.componentDetails[0].securityData &&
//         // data.componentDetails[0].securityData.securityIssues &&
//         data.componentDetails[0].securityData.securityIssues.length > 0
//       ) {
//         const maxSeverity = Math.max(
//           ...data.componentDetails[0].securityData.securityIssues.map((issue) => {
//             return issue.severity;
//           })
//         );

//         let vulnClass = 'sonatype-iq-extension-vuln-low';
//         if (maxSeverity >= 9) {
//           vulnClass = 'sonatype-iq-extension-vuln-severe';
//         } else if (maxSeverity >= 7) {
//           vulnClass = 'sonatype-iq-extension-vuln-high';
//         } else if (maxSeverity >= 5) {
//           vulnClass = 'sonatype-iq-extension-vuln-med';
//         } else if (maxSeverity >= 2) {
//           vulnClass = 'sonatype-iq-extension-vuln-low';
//         }
//         addClasses(vulnClass, element);
//       }
//     }
//   }
// });

const removeClasses = (element) => {
    //remove the class
    console.info('removing classes', element)
    element.removeClass('sonatype-iq-extension-vuln')
    element.removeClass('sonatype-iq-extension-vuln-severe')
    element.removeClass('sonatype-iq-extension-vuln-high')
    element.removeClass('sonatype-iq-extension-vuln-low')
}

// const checkPage = () => {
//   const repoType = findRepoType(window.location.href);

//   if (repoType) {
//     chrome.runtime.sendMessage({type: 'togglePage', show: true});
//     console.debug('checkPage: Found a valid repoType: ' + repoType);
//     const purl = getArtifactDetailsFromDOM(repoType, window.location.href);

//     if (purl) {
//       console.debug('checkPage: Obtained a valid purl: ' + purl);
//       chrome.runtime.sendMessage({type: 'getArtifactDetailsFromPurl', purl: purl.toString()});
//     } else {
//       console.debug('checkPage: No valid purl for : ' + repoType);
//       console.debug('checkPage: building new url and retrying: ' + repoType.versionPath);
//       const version = findVersionElement(repoType) ?? '';
//       if (version.length > 0) {
//         // TODO: This needs to be handled for the different pacakge formats
//         // const newUrl = repoType.versionPath?.replace("{url}/{packagename}", window.location.href).replace("{versionNumber}", version) ?? window.location.href;
//         const oldUrl = window.location.href.endsWith('/') ? window.location.href.slice(0, -1) : window.location.href;
//         const newUrl = oldUrl + (repoType.appendVersionPath?.replace("{versionNumber}", version));
//         console.debug('checkPage: the new url : ' + newUrl);
//         const newPurl = getArtifactDetailsFromDOM(repoType, newUrl);
//         if (newPurl) {
//           console.debug('checkPage: Obtained a valid purl and retrying getArtifactDetailsFromPurl : ' + newPurl);
//           chrome.runtime.sendMessage({type: 'getArtifactDetailsFromPurl', purl: newPurl.toString()});
//         }
//       }
//     }
//   } else {
//     chrome.runtime.sendMessage({type: 'togglePage', show: false});
//   }
// };

// checkPage();

// function findVersionElement(repoType: RepoType) {

//   const element = $(repoType.versionSelector);
//   console.info('findVersionElement versionSelector: ', repoType.versionSelector);
//   if (element.length > 0) {
//     console.info('findVersionElement', element.text().trim());
//     return element.text().trim();
//   }
//   return undefined;

// }

// function findElement(loc: string) {
//   console.info('findElement', loc);
//   const repoType = findRepoType(loc);
//   if (repoType) {
//     const element = $(repoType.titleSelector);
//     if (element.length > 0) {
//       return element;
//     }
//   }
//   return undefined;
// }

// function addClasses(vulnClass: string, element?: Cash) {
//   console.info('addClasses', vulnClass, element);
//   if (element) {
//     element.addClass(vulnClass);
//     element.addClass('sonatype-iq-extension-vuln');
//   }
// }
