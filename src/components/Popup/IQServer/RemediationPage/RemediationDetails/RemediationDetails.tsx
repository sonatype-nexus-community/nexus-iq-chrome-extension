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
import { NxList } from '@sonatype/react-shared-components'
import React, { useContext } from 'react'
import { ExtensionPopupContext } from '../../../../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../../../../context/ExtensionConfigurationContext'
import { DATA_SOURCE, REMEDIATION_LABELS } from '../../../../../utils/Constants'
import './RemediationDetails.css'
import { getNewUrlandGo } from '../../../../../utils/Helpers'

function IqRemediationDetails() {
    const popupContext = useContext(ExtensionPopupContext)
    const versionChanges = popupContext.iq?.remediationDetails?.remediation?.versionChanges
    const currentPurlVersion: string = popupContext.currentPurl?.version as string

    return (
        <React.Fragment>
            <NxList emptyMessage="No newer version is available based on this application's policy.">
                {versionChanges?.map((change, id) => {
                    const version = change.data?.component?.componentIdentifier?.coordinates?.version as string
                    if (change !== undefined) {
                        return (
                            <NxList.LinkItem
                                href='#'
                                key={`${change}-${id}`}
                                onClick={() => getNewUrlandGo(popupContext.currentTab, currentPurlVersion, version)}>
                                <NxList.Text>
                                    <small>{REMEDIATION_LABELS[change.type as string]}</small>
                                </NxList.Text>
                                <NxList.Subtext>
                                    <strong>
                                        {change.data?.component?.componentIdentifier?.coordinates ? version : 'UNKNOWN'}
                                    </strong>
                                </NxList.Subtext>
                            </NxList.LinkItem>
                        )
                    }
                })}
            </NxList>
        </React.Fragment>
    )
}

export default function RemediationDetails() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqRemediationDetails />}</div>
}
