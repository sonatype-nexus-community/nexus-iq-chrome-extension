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
// import {Puff} from '@agney/react-loading'
import {
    NxTab,
    NxTabList,
    NxTabPanel,
    NxTabs,
    NxP,
    NxFooter,
    NxFontAwesomeIcon,
} from '@sonatype/react-shared-components'
import React, { useContext, useEffect, useState } from 'react'
import { ExtensionConfigurationContext, ExtensionPopupContext } from '../../context/NexusContext'
import { DATA_SOURCE } from '../../utils/Constants'
import ComponentInfoPage from './IQServer/ComponentInfoPage/ComponentInfoPage'
import PolicyPage from './IQServer/PolicyPage/PolicyPage'
import './Popup.css'
import RemediationPage from './IQServer/RemediationPage/RemediationPage'
import LicensePage from './IQServer/LicensingPage/LicensingPage'
import SecurityPage from './IQServer/SecurityPage/SecurityPage'
import { Puff } from '@agney/react-loading'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser

function IqPopup() {
    const popupContext = useContext(ExtensionPopupContext)
    const [activeTabId, setActiveTabId] = useState(0)

    const effectiveLicenses =
        popupContext.iq &&
        popupContext.iq.componentDetails !== undefined &&
        popupContext.iq.componentDetails.licenseData !== undefined &&
        popupContext.iq.componentDetails.licenseData.effectiveLicenses !== undefined
            ? popupContext.iq.componentDetails.licenseData.effectiveLicenses
            : []

    const policyViolations =
        popupContext.iq &&
        popupContext.iq.componentDetails &&
        popupContext.iq.componentDetails.policyData &&
        popupContext.iq.componentDetails.policyData.policyViolations
            ? popupContext.iq.componentDetails.policyData.policyViolations
            : []

    const securityIssues =
        popupContext.iq &&
        popupContext.iq.componentDetails &&
        popupContext.iq.componentDetails.securityData &&
        popupContext.iq.componentDetails.securityData.securityIssues
            ? popupContext.iq.componentDetails.securityData.securityIssues
            : []

    if (popupContext !== undefined && popupContext.iq?.componentDetails !== undefined) {
        return (
            <React.Fragment>
                <div className='nx-page-content'>
                    <main className='nx-page-main'>
                        <section className='nx-tile'>
                            <div className='nx-tile-subsection nx-viewport-sized__container'>
                                {/*<NxTextInput type="textarea" value={JSON.stringify(popupContext.iq)} isPristine={true}/>*/}

                                <NxTabs activeTab={activeTabId} onTabSelect={setActiveTabId}>
                                    <NxTabList>
                                        <NxTab>Info</NxTab>
                                        <NxTab>
                                            {popupContext.iq.componentDetails.policyData?.policyViolations
                                                ? 'Remediation'
                                                : 'Versions'}
                                        </NxTab>

                                        {policyViolations.length > 0 && (
                                            <NxTab>
                                                Policy
                                                <span className={'nx-counter'}>{policyViolations.length}</span>
                                            </NxTab>
                                        )}
                                        {securityIssues.length > 0 && (
                                            <NxTab>
                                                Security
                                                <span className={'nx-counter'}>{securityIssues.length}</span>
                                            </NxTab>
                                        )}
                                        {effectiveLicenses.length > 0 && <NxTab>Legal</NxTab>}
                                        {popupContext.currentTab !== undefined && (
                                            <NxTab>
                                                <NxFontAwesomeIcon
                                                    icon={faGear as IconDefinition}
                                                    onClick={() => {
                                                        chrome.tabs.update({
                                                            url: 'options.html',
                                                        })
                                                        window.close()
                                                        // _browser.tabs.sendMessage(
                                                        //     popupContext.currentTab?.id,
                                                        //     {
                                                        //         reason: 'install',
                                                        //     },
                                                        //     (response) => {
                                                        //         logger.logMessage(
                                                        //             `Got response from calling install to get options page - ${response}`,
                                                        //             LogLevel.DEBUG
                                                        //         )
                                                        //     }
                                                        // )
                                                    }}
                                                />
                                            </NxTab>
                                        )}
                                    </NxTabList>
                                    <NxTabPanel>
                                        <ComponentInfoPage />
                                    </NxTabPanel>
                                    <NxTabPanel>
                                        <RemediationPage />
                                    </NxTabPanel>
                                    <NxTabPanel>
                                        <PolicyPage />
                                    </NxTabPanel>
                                    <NxTabPanel>
                                        <SecurityPage />
                                    </NxTabPanel>
                                    <NxTabPanel>
                                        <LicensePage />
                                    </NxTabPanel>
                                </NxTabs>
                            </div>

                            <NxFooter>
                                <NxP style={{ textAlign: 'center' }}>
                                    Copyright © 2008-present Sonatype, Inc. | Powered by Sonatype IQ Server
                                </NxP>
                            </NxFooter>
                        </section>
                    </main>
                </div>
            </React.Fragment>
        )
    } else {
        return <Puff />
    }
}

export default function Popup() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    useEffect(() => {
        console.log(`Popup: ${extensionContext}`)
    })

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqPopup />}</div>
}
