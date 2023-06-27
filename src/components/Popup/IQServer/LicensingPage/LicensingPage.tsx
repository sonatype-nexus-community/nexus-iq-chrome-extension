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
import AdvancedLegalDisplay from './AdvancedLegalDisplay/AdvancedLegalDisplay'
import { ApiLicenseLegalMetadataDTO } from '@sonatype/nexus-iq-api-client'
import { Puff } from '@agney/react-loading'

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

        if (popupContext.iq?.componentLegalDetails === undefined) {
            return <Puff />
        }

        let licenseLegalMetadataArray: ApiLicenseLegalMetadataDTO[] = []
        if (popupContext.iq.componentLegalDetails !== undefined) {
            licenseLegalMetadataArray = [...popupContext.iq.componentLegalDetails].sort((a, b) =>
                (a.licenseName !== undefined ? a.licenseName : '').localeCompare(
                    b.licenseName !== undefined ? b.licenseName : ''
                )
            )
        }

        return (
            <React.Fragment>
                {/* <div className='nx-grid-row'> */}
                {/* <section className='nx-grid-col nx-grid-col--67'> */}
                <NxTabs
                    activeTab={activeTabId}
                    onTabSelect={setActiveTabId}
                    style={{
                        maxHeight: '300px',
                        // marginBottom: '0px',
                    }}>
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
                        <NxTab>
                            <img
                                height='24px'
                                width='24px'
                                src='/images/add-on-sonatype-icon-logoblue.png'
                                className='nx-popup-logo'
                                alt='Powered by Advanced Legal Pack'
                            />{' '}
                            View Files
                        </NxTab>
                    </NxTabList>

                    <NxTabPanel className='nx-scrollable'>
                        {/* <NxList bulleted>
                                {licenseData.effectiveLicenses?.sort().map((license: LicenseDetail) => {
                                    return (
                                        <NxList.Item key={`effective-${license.licenseId}`}>
                                            <NxList.Text>{license.licenseName}</NxList.Text>
                                        </NxList.Item>
                                    )
                                })}
                            </NxList> */}
                        <NxList bulleted>
                            {licenseLegalMetadataArray !== undefined &&
                                licenseLegalMetadataArray.map((licenseLegalMetadata: ApiLicenseLegalMetadataDTO) => {
                                    return (
                                        <NxList.Item key={`effective-${licenseLegalMetadata.licenseId}`}>
                                            {licenseLegalMetadata.licenseName}
                                        </NxList.Item>
                                    )
                                })}
                        </NxList>
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
                                                <NxList.Text>{license.licenseName} </NxList.Text>
                                            </NxList.Item>
                                        )
                                    })}
                                </NxList>
                            </React.Fragment>
                        )}
                    </NxTabPanel>
                    <NxTabPanel className='nx-scrollable'>
                        <span style={{ textAlign: 'center' }}>
                            <AdvancedLegalDisplay />
                            {/*<NxButton id="nx-drawer-legal-open-button" onClick={nexusContext.toggleAlpDrawer}>*/}
                            {/* <NxButton id='nx-drawer-legal-open-button'>
                                <div>
                                    <span>View License Files</span>
                                </div>
                            </NxButton> */}
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
                            {/* <span>
                                <img
                                    src='/images/add-on-sonatype-icon-logoblue.png'
                                    className='nx-popup-logo'
                                    alt='Powered by Advanced Legal Pack'
                                />
                            </span> */}
                        </span>
                    </NxTabPanel>
                </NxTabs>
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

    return <React.Fragment>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqLicensePage />}</React.Fragment>
}
