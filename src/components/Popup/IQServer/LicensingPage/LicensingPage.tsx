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
import {
    NxTab,
    NxTabList,
    NxTabs,
    NxTabPanel,
    NxTable,
    ThreatLevelNumber,
    NxPolicyViolationIndicator,
    NxFontAwesomeIcon,
    NxButton,
    NxTooltip,
} from '@sonatype/react-shared-components'
import React, { useContext, useState } from 'react'
import { ExtensionPopupContext } from '../../../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../../../context/ExtensionConfigurationContext'
import { LicenseDetail } from '../../../../types/ArtifactMessage'
import { DATA_SOURCE } from '../../../../utils/Constants'
import './LicensingDisplay.css'
import { ApiLicenseLegalMetadataDTO } from '@sonatype/nexus-iq-api-client'
import { Puff } from '@agney/react-loading'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faCopy } from '@fortawesome/free-solid-svg-icons'

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

        const copyToClipboard = (_event: React.MouseEvent, text: string) => {
            navigator.clipboard.writeText(text)
        }

        let licenseLegalMetadataArray: ApiLicenseLegalMetadataDTO[] = []
        if (popupContext.iq.componentLegalDetails !== undefined) {
            licenseLegalMetadataArray = [...popupContext.iq.componentLegalDetails]
                .sort((a, b) =>
                    (a.licenseName !== undefined ? a.licenseName : '').localeCompare(
                        b.licenseName !== undefined ? b.licenseName : ''
                    )
                )
                .filter((license) => license.licenseId != 'Not-Supported')
        }

        return (
            <React.Fragment>
                <NxTabs
                    activeTab={activeTabId}
                    onTabSelect={setActiveTabId}
                    style={{
                        height: '400px',
                    }}>
                    <NxTabList
                        id='legalTabList'
                        style={{
                            marginBottom: '15px !important',
                            marginTop: '0px',
                            paddingTop: '0px !important',
                        }}>
                        {effectiveLicenses && effectiveLicenses.length > 0 && (
                            <NxTab className='nx-tab-ext'>
                                Effective
                                <span className={'nx-counter'}>{effectiveLicenses?.length}</span>
                            </NxTab>
                        )}
                        {observedLicenses && observedLicenses.length > 0 && (
                            <NxTab className='nx-tab-ext'>
                                Observed
                                <span className={'nx-counter'}>{observedLicenses?.length}</span>
                            </NxTab>
                        )}
                        {declaredLicenses && declaredLicenses.length > 0 && (
                            <NxTab className='nx-tab-ext'>
                                Declared
                                <span className={'nx-counter'}>{declaredLicenses?.length}</span>
                            </NxTab>
                        )}
                    </NxTabList>
                    <NxTabPanel
                        className='nx-scrollable'
                        style={
                            {
                                // height: '500px',
                                // maxHeight: '300px',
                            }
                        }>
                        <section className='nx-grid-col nx-grid-col--100 nx-scrollable'>
                            <NxTable className='nx-table' id='license-table'>
                                <NxTable.Head>
                                    <NxTable.Row className='nx-table-row nx-table-row--header'>
                                        <NxTable.Cell>Threat Group</NxTable.Cell>
                                        <NxTable.Cell>License</NxTable.Cell>
                                        <NxTable.Cell hasIcon>Copy Text</NxTable.Cell>
                                    </NxTable.Row>
                                </NxTable.Head>
                                <NxTable.Body
                                    style={{
                                        height: '300px',
                                        maxHeight: '300px',
                                    }}>
                                    {licenseLegalMetadataArray !== undefined &&
                                        licenseLegalMetadataArray.map(
                                            (licenseLegalMetadata: ApiLicenseLegalMetadataDTO) => {
                                                return (
                                                    <NxTable.Row
                                                        // isClickable
                                                        className='nx-table-row'
                                                        key={`row-${licenseLegalMetadata.licenseId}`}>
                                                        <React.Fragment key={licenseLegalMetadata.licenseId}>
                                                            <NxTable.Cell className='nx-cell'>
                                                                <NxPolicyViolationIndicator
                                                                    style={{ marginBottom: '16px !important' }}
                                                                    policyThreatLevel={
                                                                        licenseLegalMetadata.threatGroup
                                                                            ?.threatLevel as ThreatLevelNumber
                                                                    }>
                                                                    {licenseLegalMetadata.threatGroup?.name}
                                                                </NxPolicyViolationIndicator>
                                                            </NxTable.Cell>
                                                            <NxTable.Cell className='nx-cell'>
                                                                {licenseLegalMetadata.licenseName}
                                                            </NxTable.Cell>
                                                            <NxTable.Cell hasIcon>
                                                                {licenseLegalMetadata.licenseText !== undefined && (
                                                                    <NxTooltip title='Copy License Text'>
                                                                        <NxButton
                                                                            variant='icon-only'
                                                                            onClick={(event) =>
                                                                                copyToClipboard(
                                                                                    event,
                                                                                    licenseLegalMetadata.licenseText as string
                                                                                )
                                                                            }>
                                                                            <NxFontAwesomeIcon
                                                                                icon={faCopy as IconDefinition}
                                                                            />
                                                                        </NxButton>
                                                                    </NxTooltip>
                                                                )}
                                                            </NxTable.Cell>
                                                        </React.Fragment>
                                                    </NxTable.Row>
                                                )
                                            }
                                        )}
                                </NxTable.Body>
                            </NxTable>
                        </section>
                    </NxTabPanel>
                    {observedLicenses && observedLicenses.length > 0 && (
                        <NxTabPanel className='nx-scrollable'>
                            <NxTable
                                className='nx-table'
                                style={{
                                    height: '400px',
                                }}>
                                <NxTable.Head>
                                    <NxTable.Row className='nx-table-row nx-table-row--header'>
                                        <NxTable.Cell>License</NxTable.Cell>
                                    </NxTable.Row>
                                </NxTable.Head>
                                <NxTable.Body
                                    style={{
                                        height: '300px',
                                        maxHeight: '300px',
                                    }}>
                                    {observedLicenses.sort().map((license: LicenseDetail) => {
                                        return (
                                            <NxTable.Row
                                                // isClickable
                                                className='nx-table-row'
                                                key={`row-${license.licenseId}`}>
                                                <NxTable.Cell className='nx-cell'>{license.licenseName}</NxTable.Cell>
                                            </NxTable.Row>
                                        )
                                    })}
                                </NxTable.Body>
                            </NxTable>
                        </NxTabPanel>
                    )}
                    {declaredLicenses && declaredLicenses.length > 0 && (
                        <NxTabPanel className='nx-scrollable'>
                            <NxTable
                                className='nx-table'
                                style={{
                                    height: '400px',
                                }}>
                                <NxTable.Head>
                                    <NxTable.Row className='nx-table-row nx-table-row--header'>
                                        <NxTable.Cell>License</NxTable.Cell>
                                    </NxTable.Row>
                                </NxTable.Head>
                                <NxTable.Body
                                    style={{
                                        height: '300px',
                                        maxHeight: '300px',
                                    }}>
                                    {declaredLicenses.sort().map((license: LicenseDetail) => {
                                        return (
                                            <NxTable.Row
                                                // isClickable
                                                className='nx-table-row'
                                                key={`row-${license.licenseId}`}>
                                                <NxTable.Cell className='nx-cell'>{license.licenseName}</NxTable.Cell>
                                            </NxTable.Row>
                                        )
                                    })}
                                </NxTable.Body>
                            </NxTable>
                        </NxTabPanel>
                    )}
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
