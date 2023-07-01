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

import React, { useEffect, useState } from 'react'
import { getDefaultPopupContext, ExtensionPopupContext } from '../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../context/ExtensionConfigurationContext'
import Popup from './Popup'
import { logger, LogLevel } from '../../logger/Logger'
import { DEFAULT_EXTENSION_SETTINGS, ExtensionConfiguration } from '../../types/ExtensionConfiguration'
import { readExtensionConfiguration } from '../../messages/SettingsMessages'
import { MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS } from '../../types/Message'
import { PackageURL } from 'packageurl-js'
import merge from 'ts-deepmerge'

import {
    getAllComponentVersions,
    getComponentDetails,
    getComponentLegalDetails,
    getRemediationDetailsForComponent,
    pollForComponentEvaluationResult,
    requestComponentEvaluationByPurls,
} from '../../messages/IqMessages'
import {
    ApiComponentDetailsDTOV2,
    ApiComponentEvaluationResultDTOV2,
    ApiComponentEvaluationTicketDTOV2,
    ApiComponentRemediationDTO,
    ApiLicenseLegalComponentReportDTO,
} from '@sonatype/nexus-iq-api-client'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser

export default function ExtensionPopup() {
    const [extensionConfig, setExtensionConfig] = useState<ExtensionConfiguration>(DEFAULT_EXTENSION_SETTINGS)
    const [popupContext, setPopupContext] = useState<ExtensionPopupContext>(
        getDefaultPopupContext(extensionConfig.dataSource)
    )
    const [purl, setPurl] = useState<PackageURL | undefined>(undefined)

    /**
     * Load Extension Settings and get PURL for current active tab.
     *
     * This is our onComponentDidMount equivalent.
     *
     * We read our current ExtensionConfig and request the PURL for the current active Tab.
     */
    useEffect(() => {
        readExtensionConfiguration().then((response) => {
            logger.logMessage(`ExtensionPopup useEffect Response: ${response}`, LogLevel.DEBUG)
            if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
                if (response.data === undefined) {
                    setExtensionConfig(DEFAULT_EXTENSION_SETTINGS)
                } else {
                    setExtensionConfig(response.data as ExtensionConfiguration)
                }
            }
        })

        logger.logMessage('Popup requesting PURL for current active Tab', LogLevel.INFO)
        _browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            const [tab] = tabs
            const newPopupContextWithTab = { currentTab: tab as chrome.tabs.Tab | browser.tabs.Tab }
            setPopupContext((c) => merge(c, newPopupContextWithTab))
            logger.logMessage(`Requesting PURL from Tab ${tab.url}`, LogLevel.DEBUG)
            if (tab.status != 'unloaded') {
                _browser.tabs
                    .sendMessage(tab.id, {
                        type: MESSAGE_REQUEST_TYPE.CALCULATE_PURL_FOR_PAGE,
                        params: {
                            tabId: tab.id,
                            url: tab.url,
                        },
                    })
                    .catch((err) => {
                        logger.logMessage(`Error caught calculating PURL from Tab`, LogLevel.DEBUG, err)
                    })
                    .then((response) => {
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        if (_browser.runtime.lastError) {
                            console.error('ERROR in here', _browser.runtime.lastError.message, response)
                        }
                        logger.logMessage('Calc Purl Response: ', LogLevel.INFO, response)
                        if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
                            setPurl(PackageURL.fromString(response.data.purl))
                        }
                    })
            }
        })
    }, [])

    /**
     * When PURL changes (initially caused by our onComponentDidMount useEffect above),
     * we kick off data gathering for the Component to put back into state.
     */
    useEffect(() => {
        if (purl !== undefined) {
            logger.logMessage(`In ExtensionPopup and PURL changed: ${purl}`, LogLevel.DEBUG)

            const newPopupContextWithPurl = { currentPurl: purl }
            setPopupContext((c) => ({
                ...c,
                ...newPopupContextWithPurl,
            }))

            _browser.storage.local.get('componentDetails').then((response) => {
                const newPopupContextWithComponentDetails = {
                    iq: response,
                }
                logger.logMessage(
                    `Updating PopUp Context with Component Details from Storage`,
                    LogLevel.DEBUG,
                    newPopupContextWithComponentDetails
                )
                setPopupContext((c) => merge(c, newPopupContextWithComponentDetails))

                /**
                 * Get additional detail about this Component Version
                 *
                 * projectData is not populated in the Evaluation Response :-(
                 */
                getComponentDetails({
                    type: MESSAGE_REQUEST_TYPE.GET_COMPONENT_DETAILS,
                    params: {
                        purls: [purl.toString()],
                    },
                }).then((componentDetailsResponse) => {
                    if (componentDetailsResponse.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
                        logger.logMessage(
                            'Got Response to GetComponentDetails',
                            LogLevel.DEBUG,
                            componentDetailsResponse
                        )
                        if (
                            componentDetailsResponse.data !== undefined &&
                            'componentDetails' in componentDetailsResponse.data
                        ) {
                            const componentDetails = (
                                componentDetailsResponse.data.componentDetails as Array<ApiComponentDetailsDTOV2>
                            ).pop()
                            if (componentDetails) {
                                const newPopupContextWithMoreComponentDetails = {
                                    iq: {
                                        componentDetails: {
                                            catalogDate: componentDetails.catalogDate,
                                            integrityRating: componentDetails.integrityRating,
                                            hygieneRating: componentDetails.hygieneRating,
                                            projectData: componentDetails.projectData,
                                        },
                                    },
                                }

                                logger.logMessage(
                                    `Updating PopUp Context with additional Component Details`,
                                    LogLevel.DEBUG,
                                    newPopupContextWithMoreComponentDetails
                                )
                                setPopupContext((c) => merge(c, newPopupContextWithMoreComponentDetails))
                            }
                        }
                    }
                })
            })
        }
    }, [purl])

    /**
     * Separate effect for readability trigger when the PURL changes.
     *
     * Obtain All Versions of the Component
     */
    useEffect(() => {
        if (purl !== undefined) {
            /**
             * Load all known versions of the current Component
             */
            getAllComponentVersions({
                type: MESSAGE_REQUEST_TYPE.GET_COMPONENT_VERSIONS,
                params: {
                    purl: purl.toString(),
                },
            }).then((allVersionsResponse) => {
                if (allVersionsResponse.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
                    logger.logMessage('Got Response to getAllComponentVersions', LogLevel.DEBUG, allVersionsResponse)
                    if (allVersionsResponse.data !== undefined) {
                        const allVersions =
                            'versions' in allVersionsResponse.data
                                ? (allVersionsResponse.data.versions as Array<string>)
                                : []

                        if (allVersions.length == 0) {
                            logger.logMessage(`No versions known for ${purl.toString()}`, LogLevel.INFO)
                            return
                        }

                        const allVersionsPurl: string[] = []
                        allVersions.map((version) => {
                            const versionPurl = PackageURL.fromString(purl.toString())
                            versionPurl.version = version
                            allVersionsPurl.push(versionPurl.toString())
                        })
                        logger.logMessage('Created list of all versions by purl', LogLevel.DEBUG, allVersionsPurl)

                        requestComponentEvaluationByPurls({
                            type: MESSAGE_REQUEST_TYPE.REQUEST_COMPONENT_EVALUATION_BY_PURLS,
                            params: {
                                purls: allVersionsPurl,
                            },
                        }).then((r2) => {
                            if (chrome.runtime.lastError) {
                                logger.logMessage('Error handling Eval Comp Purl', LogLevel.ERROR)
                            }

                            const evaluateRequestTicketResponse = r2.data as ApiComponentEvaluationTicketDTOV2
                            logger.logMessage(
                                `evaluateRequestTicketResponse in get all versions`,
                                LogLevel.DEBUG,
                                evaluateRequestTicketResponse
                            )

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
                                    const newPopupContextAllVersions = {
                                        iq: {
                                            allVersions: (evalResponse as ApiComponentEvaluationResultDTOV2).results,
                                        },
                                    }
                                    logger.logMessage(
                                        `Updating PopUp Context with All Component Versions`,
                                        LogLevel.DEBUG,
                                        newPopupContextAllVersions
                                    )
                                    setPopupContext((c) => merge(c, newPopupContextAllVersions))
                                })
                                .catch((err) => {
                                    logger.logMessage(`Error in Poll: ${err}`, LogLevel.ERROR)
                                })
                                .finally(() => {
                                    logger.logMessage('Stopping poll for results - they are in!', LogLevel.INFO)
                                    stopPolling()
                                })
                        })
                    }
                }
            })
        }
    }, [purl])

    /**
     * Separate effect for readability trigger when the PURL changes.
     *
     * Obtain Component Legal Details and Remediation
     */
    useEffect(() => {
        if (purl !== undefined) {
            /**
             * Get Legal Details for this Component
             *
             */
            getComponentLegalDetails({
                type: MESSAGE_REQUEST_TYPE.GET_COMPONENT_LEGAL_DETAILS,
                params: {
                    purl: purl.toString(),
                },
            }).then((componentLegalDetailsResponse) => {
                if (componentLegalDetailsResponse.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
                    logger.logMessage(
                        'Got Response to GetComponentLegalDetails',
                        LogLevel.DEBUG,
                        componentLegalDetailsResponse
                    )
                    if (
                        componentLegalDetailsResponse.data !== undefined &&
                        'componentLegalDetails' in componentLegalDetailsResponse.data
                    ) {
                        const componentLegalDetails = componentLegalDetailsResponse.data
                            .componentLegalDetails as ApiLicenseLegalComponentReportDTO
                        const newPopupContextLegalDetails = {
                            iq: {
                                componentLegalDetails: componentLegalDetails.licenseLegalMetadata,
                            },
                        }
                        logger.logMessage(
                            `Updating PopUp Context with Legal Details`,
                            LogLevel.DEBUG,
                            newPopupContextLegalDetails
                        )
                        setPopupContext((c) => merge(c, newPopupContextLegalDetails))
                    }
                } else {
                    logger.logMessage(
                        'Unable to get response to getComponentLegalDetails',
                        LogLevel.ERROR,
                        componentLegalDetailsResponse.status_detail
                    )
                }
            })

            /**
             * Request Remediation Details for the current PURL
             */
            getRemediationDetailsForComponent({
                type: MESSAGE_REQUEST_TYPE.GET_REMEDIATION_DETAILS_FOR_COMPONENT,
                params: {
                    purl: purl.toString(),
                },
            }).then((remediationResponse) => {
                if (remediationResponse.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
                    logger.logMessage(
                        'Got Response to getRemediationDetailsForComponent',
                        LogLevel.DEBUG,
                        remediationResponse
                    )
                    const newPopupContextRemediationDetails = {
                        iq: {
                            remediationDetails:
                                'remediation' in (remediationResponse.data as ApiComponentRemediationDTO)
                                    ? (remediationResponse.data as ApiComponentRemediationDTO)
                                    : undefined,
                        },
                    }
                    logger.logMessage(
                        `Updating PopUp Context wtih Remediation`,
                        LogLevel.DEBUG,
                        newPopupContextRemediationDetails
                    )
                    setPopupContext((c) => merge(c, newPopupContextRemediationDetails))
                } else {
                    logger.logMessage(
                        'Unable to get response to getRemediationDetailsForComponent',
                        LogLevel.ERROR,
                        remediationResponse.status
                    )
                }
            })
        }
    }, [purl])

    return (
        <ExtensionConfigurationContext.Provider value={extensionConfig}>
            <ExtensionPopupContext.Provider value={popupContext}>
                {/* {popupContext.supportsLicensing && <AlpDrawer />} */}
                <Popup />
            </ExtensionPopupContext.Provider>
        </ExtensionConfigurationContext.Provider>
    )
}
