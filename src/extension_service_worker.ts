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

import { logger, LogLevel } from './logger/Logger'
import { findRepoType } from './utils/UrlParsing'

import { MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS, MessageRequest, MessageResponseFunction } from './types/Message'
import { propogateCurrentComponentState } from './messages/ComponentStateMessages'
import {
    requestComponentEvaluationByPurls,
    getApplications,
    pollForComponentEvaluationResult,
} from './messages/IqMessages'
import { ApiComponentEvaluationResultDTOV2, ApiComponentEvaluationTicketDTOV2 } from '@sonatype/nexus-iq-api-client'
import { ComponentState, getForComponentPolicyViolations } from './types/Component'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser

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
            getApplications().then((response) => {
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

    // Handlers are async - so return true
    return true
}

/**
 * Handler for Install Event for our Extension
 */
_browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        _browser.tabs.create({ url: 'options.html?install' })
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
        propogateCurrentComponentState(tabId, ComponentState.EVALUATING)
        _browser.tabs
            .sendMessage(tabId, {
                type: MESSAGE_REQUEST_TYPE.CALCULATE_PURL_FOR_PAGE,
                params: {
                    tabId: tabId,
                    url: url,
                },
            })
            .catch((err) => {
                logger.logMessage(`Error caught calling CALCULATE_PURL_FOR_PAGE`, LogLevel.DEBUG, err)
            })
            .then((response) => {
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (_browser.runtime.lastError) {
                    logger.logMessage('Error response from CALCULATE_PURL_FOR_PAGE', LogLevel.ERROR, response)
                }
                logger.logMessage('Calc Purl Response: ', LogLevel.INFO, response)

                // chrome.sidePanel.setPanelBehavior({
                //     openPanelOnActionClick: true,
                // })

                if (response !== undefined && response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
                    requestComponentEvaluationByPurls({
                        type: MESSAGE_REQUEST_TYPE.REQUEST_COMPONENT_EVALUATION_BY_PURLS,
                        params: {
                            purls: [response.data.purl],
                        },
                    }).then((r2) => {
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        if (_browser.runtime.lastError) {
                            logger.logMessage('Error handling requestComponentEvaluationByPurls', LogLevel.ERROR)
                        }

                        const evaluateRequestTicketResponse = r2.data as ApiComponentEvaluationTicketDTOV2

                        const { promise, stopPolling } = pollForComponentEvaluationResult(
                            evaluateRequestTicketResponse.applicationId === undefined
                                ? ''
                                : evaluateRequestTicketResponse.applicationId,
                            evaluateRequestTicketResponse.resultId === undefined
                                ? ''
                                : evaluateRequestTicketResponse.resultId,
                            1000
                        )

                        promise
                            .then((evalResponse) => {
                                const componentDetails = (
                                    evalResponse as ApiComponentEvaluationResultDTOV2
                                ).results?.pop()
                                const componentState = getForComponentPolicyViolations(componentDetails?.policyData)

                                propogateCurrentComponentState(tabId, componentState)

                                _browser.action.enable(tabId, () => {
                                    _browser.action.setIcon({
                                        tabId: tabId,
                                        path:
                                            componentState == ComponentState.NONE
                                                ? '/images/sonatype-lifecycle-icon-white-32x32.png'
                                                : '/images/sonatype-lifecycle-icon_Vulnerable-32x32.png',
                                    })
                                })

                                logger.logMessage(
                                    `Sonatype Extension ENABLED for ${url} : ${response.data.purl}`,
                                    LogLevel.INFO
                                )

                                _browser.storage.local
                                    .set({
                                        componentDetails: componentDetails,
                                    })
                                    .then(() => {
                                        logger.logMessage('We wrote to the session', LogLevel.DEBUG, componentDetails)
                                    })
                            })
                            .catch((err) => {
                                logger.logMessage(`Error in Poll: ${err}`, LogLevel.ERROR)
                            })
                            .finally(() => {
                                logger.logMessage('Stopping poll for results - they are in!', LogLevel.INFO)
                                stopPolling()
                            })
                    })
                } else {
                    logger.logMessage(
                        `Disabling Sonatype Browser Extension for ${url} - Could not determine PURL.`,
                        LogLevel.DEBUG
                    )
                    chrome.action.disable(tabId, () => {
                        /**
                         * @todo Change Extension ICON
                         */
                        logger.logMessage(`Sonatype Extension DISABLED for ${url}`, LogLevel.INFO)
                    })
                }
            })
    } else {
        logger.logMessage(`Disabling Sonatype Browser Extension for ${url} - Not a supported Registry.`, LogLevel.DEBUG)
        chrome.action.disable(tabId, () => {
            /**
             * @todo Change Extension ICON
             */
            logger.logMessage(`Sonatype Extension DISABLED for ${url}`, LogLevel.INFO)
        })
    }
}

/**
 * Fired when the current tab changes, but the tab may itself not change
 */
_browser.tabs.onActivated.addListener(({ tabId }: { tabId: number }) => {
    _browser.tabs.get(tabId, (tab) => {
        if (tab.url !== undefined) {
            enableDisableExtensionForUrl(tab.url, tabId)
        }
    })
})

/**
 * This is fired for every tab on every update - we should filter before sending a message - this is carnage!
 */
_browser.tabs.onUpdated.addListener((tabId: number, changeInfo: object, tab: chrome.tabs.Tab | browser.tabs.Tab) => {
    if ('status' in changeInfo && changeInfo.status == 'complete' && tab.active && tab.url !== undefined) {
        enableDisableExtensionForUrl(tab.url, tabId)
    }
})
