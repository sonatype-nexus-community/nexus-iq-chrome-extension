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
import {NxDescriptionList, NxH3} from '@sonatype/react-shared-components'
import React, {useContext} from 'react'
import {
  ExtensionConfigurationContext,
  ExtensionPopupContext,
} from '../../../../../context/NexusContext'
import {DATA_SOURCE, REMEDIATION_LABELS} from '../../../../../utils/Constants'
import './RemediationDetails.css'
import { logger, LogLevel } from '../../../../../logger/Logger'

function IqRemediationDetails() {
  const popupContext = useContext(ExtensionPopupContext)
  const versionChanges = popupContext.iq?.remediationDetails?.remediation?.versionChanges

  function getNewUrlandGo(version:string) {
    const currentTabUrl = popupContext.currentTab?.url
    const currentPurlVersion = popupContext.currentPurl?.version
    
    logger.logMessage(`Remediation Details: Replacing URL with ${version}`, LogLevel.DEBUG)
    if (currentPurlVersion !== undefined && currentTabUrl !== undefined) {
      const currentVersion = new RegExp( currentPurlVersion as string)
      const newUrl = currentTabUrl?.toString().replace(currentVersion, version)
      logger.logMessage(`Remediation Details: Generated new URL ${newUrl}`, LogLevel.DEBUG)
      // TODO: Make work with other browsers and error handling
      chrome.tabs.update({
        url: newUrl,
      });
      window.close()
      
    } else {
      logger.logMessage(`Remediation Details: currentTabURL or currentPul are undefined when trying to replace with ${version}`, LogLevel.ERROR)
    } 
  }

  return (
      <React.Fragment>
        {versionChanges && versionChanges.length > 0 && (
          <NxH3>Recommended Versions</NxH3>
        )}

      <NxDescriptionList
          emptyMessage={"No recommended versions available."}>
        {versionChanges?.map((change, id) => {
          const version = change.data?.component?.componentIdentifier?.coordinates?.version as string
          if (change !== undefined) {
            return (
                <NxDescriptionList.ButtonItem 
                    onClick={() => getNewUrlandGo(version)}
                      key={id}
                      term={REMEDIATION_LABELS[change.type as string]}
                      description={
                        change.data?.component?.componentIdentifier?.coordinates
                            ? change.data.component.componentIdentifier.coordinates.version
                            : 'UNKNOWN'
                      }
                  />
            )
          }
        })}
      </NxDescriptionList>
      </React.Fragment>
  )
}

export default function RemediationDetails() {
  const extensionContext = useContext(ExtensionConfigurationContext)

  return (
      <div>
        {extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && (
            <IqRemediationDetails/>
        )}
      </div>
  )
}

