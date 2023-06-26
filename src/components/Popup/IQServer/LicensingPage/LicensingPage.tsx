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
import { NxButton, NxList, NxTextLink, NxTab, NxTabList, NxTabs, NxTabPanel } from '@sonatype/react-shared-components'
import React, { useContext, useState } from 'react'
import { ExtensionConfigurationContext, ExtensionPopupContext } from '../../../../context/NexusContext'
import { LicenseDetail } from '../../../../types/ArtifactMessage'
import LicenseThreat from '../../../Common/LicenseThreat/LicenseThreat'
import { DATA_SOURCE } from '../../../../utils/Constants'
import './LicensingDisplay.css'

function IqLicensePage() {
    const popupContext = useContext(ExtensionPopupContext)
    const licenseData = popupContext.iq?.componentDetails?.licenseData
    const [activeTabId, setActiveTabId] = useState(0)

    if (licenseData !== undefined) {
        const observedLicenses = licenseData?.observedLicenses?.filter(
            (license) => license.licenseId != 'Not-Supported'
        )
        const declaredLicenses = licenseData?.declaredLicenses
        const effectiveLicenses = licenseData?.effectiveLicenses

        return (
            <React.Fragment>
                {/* <div className='nx-grid-row'> */}
                {/* <section className='nx-grid-col nx-grid-col--67'> */}
                <NxTabs activeTab={activeTabId} onTabSelect={setActiveTabId}>
                    <NxTabList>
                        {effectiveLicenses && effectiveLicenses.length > 0 && (
                            <NxTab>
                                Effective
                                <span className={'nx-counter'}>{effectiveLicenses?.length}</span>
                            </NxTab>
                        )}
                        {observedLicenses && observedLicenses.length > 0 && (
                            <NxTab>
                                Observed
                                <span className={'nx-counter'}>{observedLicenses?.length}</span>
                            </NxTab>
                        )}
                        {declaredLicenses && declaredLicenses.length > 0 && (
                            <NxTab>
                                Declared
                                <span className={'nx-counter'}>{declaredLicenses?.length}</span>
                            </NxTab>
                        )}
                    </NxTabList>

                    <NxTabPanel className='nx-scrollable'>
                        <React.Fragment>
                            <NxList bulleted>
                                {licenseData.effectiveLicenses?.sort().map((license: LicenseDetail) => {
                                    return (
                                        <NxList.Item key={`effective-${license.licenseId}`}>
                                            <NxList.Text>{license.licenseName}</NxList.Text>
                                        </NxList.Item>
                                    )
                                })}
                            </NxList>
                        </React.Fragment>
                    </NxTabPanel>

                    <NxTabPanel className='nx-scrollable'>
                        {observedLicenses && observedLicenses.length > 0 && (
                            <React.Fragment>
                                <NxList bulleted>
                                    {observedLicenses.sort().map((license: LicenseDetail) => {
                                        return (
                                            <NxList.Item key={`observed-${license.licenseId}`}>
                                                <NxList.Text>{license.licenseName}</NxList.Text>
                                            </NxList.Item>
                                        )
                                    })}
                                </NxList>
                            </React.Fragment>
                        )}
                    </NxTabPanel>
                    <NxTabPanel className='nx-scrollable'>
                        {declaredLicenses && declaredLicenses.length > 0 && (
                            <React.Fragment>
                                <NxList bulleted>
                                    {declaredLicenses.sort().map((license: LicenseDetail) => {
                                        return (
                                            <NxList.Item key={`declared-${license.licenseId}`}>
                                                <NxList.Text>{license.licenseName}</NxList.Text>
                                            </NxList.Item>
                                        )
                                    })}
                                </NxList>
                            </React.Fragment>
                        )}
                    </NxTabPanel>
                </NxTabs>
                {/* </section> */}
                {/* <section className='nx-grid-col nx-grid-col--33 nx-scrollable'>
                        <LicenseThreat />
                    </section> */}
                {/* </div> */}

                <hr className='nx-grid-h-keyline' />
                {/* <div className='nx-grid-row'> */}
                {/* <section className='nx-grid-col nx-grid-col--100'> */}
                <span style={{ textAlign: 'center' }}>
                    {/*<NxButton id="nx-drawer-legal-open-button" onClick={nexusContext.toggleAlpDrawer}>*/}
                    <NxButton id='nx-drawer-legal-open-button'>
                        <div>
                            <span>View License Files</span>
                        </div>
                    </NxButton>
                    <span className={'smaller-font-for-legal'}>
                        <div>
                            Powered by{' '}
                            <NxTextLink
                                external
                                href='https://help.sonatype.com/iqserver/product-information/add-on-packs/advanced-legal-pack-quickstart'>
                                Advanced Legal Pack
                            </NxTextLink>
                        </div>
                        <div>
                            <span>A Sonatype Lifecycle Add-On</span>
                        </div>
                    </span>
                    <span>
                        <img
                            src='/images/add-on-sonatype-icon-logoblue.png'
                            className='nx-popup-logo'
                            alt='Powered by Advanced Legal Pack'
                        />
                    </span>
                </span>
                {/* </section> */}
                {/* </div> */}
            </React.Fragment>
        )
    } else {
        return (
            <React.Fragment>
                <p>No license information available.</p>
            </React.Fragment>
        )
    }
}

export default function LicensePage() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return (
        // <div>
        <React.Fragment>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqLicensePage />}</React.Fragment>

        // </div>
    )
}
