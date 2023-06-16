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

import React, { useEffect, useState } from "react";
import { 
  getDefaultPopupContext, 
  ExtensionConfigurationContext, 
  ExtensionPopupContext,
} from "../../context/NexusContext";
import AlpDrawer from "../AlpDrawer/AlpDrawer";
import Popup from "./Popup";
import { logger, LogLevel } from '../../logger/Logger'
import { DEFAULT_EXTENSION_SETTINGS, ExtensionConfiguration } from "../../types/ExtensionConfiguration";
import { readExtensionConfiguration } from "../../messages/SettingsMessages";
import { MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS } from "../../types/Message";
import { PackageURL } from "packageurl-js";
import { getAllComponentVersions, getComponentDetails, getRemediationDetailsForComponent, pollForComponentEvaluationResult, requestComponentEvaluationByPurls } from "../../messages/IqMessages";
import { ApiComponentDetailsDTOV2, ApiComponentEvaluationResultDTOV2, ApiComponentEvaluationTicketDTOV2, ApiComponentRemediationDTO } from "@sonatype/nexus-iq-api-client";

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser;

export default function ExtensionPopup() {
    const [extensionConfig, setExtensionConfig] = useState<ExtensionConfiguration>(DEFAULT_EXTENSION_SETTINGS)
    const [popupContext, setPopupContext] = useState<ExtensionPopupContext>(getDefaultPopupContext(extensionConfig.dataSource))
    const [purl, setPurl] = useState<PackageURL|undefined>(undefined)

    /**
     * Load Extension Settings and get PURL for current active tab.
     * 
     * This is our onComponentDidMount equivalent.
     */
    useEffect(() => {
      readExtensionConfiguration().then((response) => {
        console.log('ExtensionPopup useEffect Response:', response)
        if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
          if (response.data === undefined) {
            setExtensionConfig(DEFAULT_EXTENSION_SETTINGS)
          } else {
            setExtensionConfig((response.data as ExtensionConfiguration))
          }
        }
      })
      
      logger.logMessage('Popup requesting PURL for current active Tab', LogLevel.INFO)
      _browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
        const [tab] = tabs
        logger.logMessage(`Requesting PURL from Tab ${tab.url}`, LogLevel.DEBUG)
        if (tab.status != 'unloaded') {
          _browser.tabs.sendMessage(tab.id, {
            "type": MESSAGE_REQUEST_TYPE.CALCULATE_PURL_FOR_PAGE,
            "params": {
              "tabId": tab.id,
              "url": tab.url
            }
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('ERROR in here', chrome.runtime.lastError.message, response)
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
     * we kick off data gathering for the Componet to put back into state.
     */
    useEffect(() => {
      if (purl !== undefined) {
        logger.logMessage(`In ExtensionPopup and PURL changed: ${purl}`, LogLevel.DEBUG)
        requestComponentEvaluationByPurls({
          type: MESSAGE_REQUEST_TYPE.REQUEST_COMPONENT_EVALUATION_BY_PURLS,
          params: {
            purls: [purl.toString()]
          }
        }).then((r2) => {
          if (chrome.runtime.lastError) {
            logger.logMessage('Error handling Eval Comp Purl', LogLevel.ERROR)
          }

          const evaluateRequestTicketResponse = r2.data as ApiComponentEvaluationTicketDTOV2

          const { promise, stopPolling } = pollForComponentEvaluationResult(
            (evaluateRequestTicketResponse.applicationId === undefined ? '' : evaluateRequestTicketResponse.applicationId), 
            (evaluateRequestTicketResponse.resultId === undefined ? '' : evaluateRequestTicketResponse.resultId), 
            1000
          )

          promise.then((evalResponse) => {
            const newPopupContext = {...popupContext}
            if (!newPopupContext.iq) {
              newPopupContext.iq = {}
            }
            newPopupContext.currentPurl = purl
            newPopupContext.iq.componentDetails = (evalResponse as ApiComponentEvaluationResultDTOV2).results?.pop()
            logger.logMessage(`Updating PopUp Context`, LogLevel.DEBUG, newPopupContext)
            setPopupContext(newPopupContext)
          }).catch((err) => {
            logger.logMessage(`Error in Poll: ${err}`, LogLevel.ERROR)
          }).finally(() => {
            logger.logMessage('Stopping poll for results - they are in!', LogLevel.INFO)
            stopPolling()
            /**
             * Get additional detail about this Componet Version
             * 
             * projectData is not populated in the Evaluation Response :-(
             */
            getComponentDetails({
              type: MESSAGE_REQUEST_TYPE.GET_COMPONENT_DETAILS,
              params: {
                purls: [purl.toString()]
              }
            }).then((componentDetailsResponse) => {
              if (componentDetailsResponse.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
                logger.logMessage('Got Response to GetComponentDetails', LogLevel.DEBUG, componentDetailsResponse)
                if (componentDetailsResponse.data && 'componentDetails' in componentDetailsResponse.data) {
                  const componentDetails = (componentDetailsResponse.data.componentDetails as Array<ApiComponentDetailsDTOV2>).pop()
                  if (componentDetails) {
                    const newPopupContext = {...popupContext}
                    if (!newPopupContext.iq) {
                      newPopupContext.iq = {}
                    }
                    if (newPopupContext.iq.componentDetails) {
                      newPopupContext.iq.componentDetails.projectData = componentDetails.projectData
                      setPopupContext(newPopupContext)
                    }
                  }
                } 
              }
            })
          })
        })

        /** 
         * Request Remediation Details for the current PURL
         */
        getRemediationDetailsForComponent({
          type: MESSAGE_REQUEST_TYPE.GET_REMEDIATION_DETAILS_FOR_COMPONENT,
          params: {
            purl: purl.toString()
          }
        }).then((remediationResponse) => {
          if (remediationResponse.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
            const newPopupContext = {...popupContext}
            if (!newPopupContext.iq) {
              newPopupContext.iq = {}
            }
            if (remediationResponse.data) {
              newPopupContext.iq.remediationDetails = (
                'remediation' in remediationResponse.data ? remediationResponse.data.remediation as ApiComponentRemediationDTO : undefined
              )
            }
            setPopupContext(newPopupContext)
          }
        })

        /**
         * Load all known versions of the current Component
         */
        getAllComponentVersions({
          "type": MESSAGE_REQUEST_TYPE.GET_COMPONENT_VERSIONS,
          "params": {
            "purl": purl.toString()
          }
        }).then((allVersionsResponse) => {
          if (allVersionsResponse.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
            const newPopupContext = {...popupContext}
            if (!newPopupContext.iq) {
              newPopupContext.iq = {}
            }
            if (allVersionsResponse.data) {
              newPopupContext.iq.allVersions = ('versions' in allVersionsResponse.data ? allVersionsResponse.data.versions as Array<string> : [])
            }
            setPopupContext(newPopupContext)
          }
        })
      }
    }, [purl])

    return (
      <ExtensionConfigurationContext.Provider value={extensionConfig}>
        <ExtensionPopupContext.Provider value={popupContext}>
          {popupContext.supportsLicensing && <AlpDrawer />}
          <div className="nx-page-content">
            <main className="nx-page-main nx-viewport-sized">
              <Popup />
            </main>
          </div>
        </ExtensionPopupContext.Provider>
      </ExtensionConfigurationContext.Provider>
    )
}