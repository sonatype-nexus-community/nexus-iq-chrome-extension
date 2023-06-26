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
    NxDescriptionList,
    NxList,
    NxLoadingSpinner,
    NxPolicyViolationIndicator,
    NxTextLink,
    NxTooltip,
    ThreatLevelNumber,
} from '@sonatype/react-shared-components'
import React, { useContext } from 'react'
import { ExtensionConfigurationContext, ExtensionPopupContext } from '../../../../context/NexusContext'
import { DATA_SOURCE, DATA_SOURCES } from '../../../../utils/Constants'
import LicenseThreat from '../../../Common/LicenseThreat/LicenseThreat'
import SecurityThreat from '../../../Common/SecurityThreat/SecurityThreat'
import './ComponentInfoPage.css'
import { ApiComponentPolicyViolationListDTOV2 } from '@sonatype/nexus-iq-api-client'
import { getMaxThreatLevelForPolicyViolations } from '../../../../types/Component'
import { stripTrailingSlash } from '../../../../utils/Helpers'

const formatDate = (date: Date | undefined | null): string => {
    if (date) {
        const dateTime = new Date(date)
        const noTime = dateTime.toUTCString().split(' ').slice(0, 4).join(' ')
        return noTime
    }
    return 'N/A'
}

function GetPolicyViolationIndicator({ policyData }: { policyData: ApiComponentPolicyViolationListDTOV2 }) {
    return (
        <React.Fragment>
            <header className='nx-grid-header'>
                <h3 className={'nx-h3'}>Max Policy Violation</h3>
            </header>
            <NxPolicyViolationIndicator
                style={{ marginBottom: '16px !important' }}
                policyThreatLevel={
                    Math.round(getMaxThreatLevelForPolicyViolations(policyData)) as ThreatLevelNumber
                }></NxPolicyViolationIndicator>
        </React.Fragment>
    )
}

function IqComponentInfo() {
    const popupContext = useContext(ExtensionPopupContext)
    const extensionContext = useContext(ExtensionConfigurationContext)
    const iqServerUrl = stripTrailingSlash(extensionContext.host as string)

    if (popupContext.iq?.componentDetails?.component?.displayName == undefined) {
        return <NxLoadingSpinner />
    }
    return (
        <React.Fragment>
            <div className='nx-grid-row popup-content-row'>
                <section className='nx-grid-col nx-grid-col--67 nx-scrollable'>
                    <header className='nx-grid-header'>
                        <NxTooltip
                            placement='top'
                            title={<>{popupContext.iq?.componentDetails?.component?.displayName}</>}>
                            <h3 className='nx-h2 nx-grid-header__title'>
                                {popupContext.iq?.componentDetails?.component?.displayName}
                            </h3>
                        </NxTooltip>
                    </header>
                    <NxDescriptionList>
                        {popupContext.iq?.componentDetails?.component?.hash != null && (
                            <NxDescriptionList.Item>
                                <NxDescriptionList.Term>Hash</NxDescriptionList.Term>
                                <NxDescriptionList.Description>
                                    {popupContext.iq?.componentDetails?.component?.hash}
                                </NxDescriptionList.Description>
                            </NxDescriptionList.Item>
                        )}
                        {popupContext.iq?.componentDetails.projectData !== undefined &&
                            popupContext.iq?.componentDetails.projectData?.projectMetadata?.organization !==
                                undefined &&
                            popupContext.iq?.componentDetails.projectData?.projectMetadata?.organization.length > 0 && (
                                <NxDescriptionList.Item>
                                    <NxDescriptionList.Term>Project</NxDescriptionList.Term>
                                    <NxDescriptionList.Description>
                                        {popupContext.iq?.componentDetails.projectData?.projectMetadata.organization}
                                    </NxDescriptionList.Description>
                                </NxDescriptionList.Item>
                            )}
                        {popupContext.iq?.componentDetails.projectData &&
                            popupContext.iq?.componentDetails.projectData.projectMetadata?.description !==
                                undefined && (
                                <NxDescriptionList.Item>
                                    <NxDescriptionList.Term>Description</NxDescriptionList.Term>
                                    <NxDescriptionList.Description>
                                        {popupContext.iq?.componentDetails.projectData?.projectMetadata.description}
                                    </NxDescriptionList.Description>
                                </NxDescriptionList.Item>
                            )}
                        {popupContext.iq?.componentDetails.integrityRating != null && (
                            <NxDescriptionList.Item>
                                <NxDescriptionList.Term>
                                    <NxTextLink
                                        external
                                        href='https://help.sonatype.com/fw/next-gen-firewall-features/protection-from-pending-and-suspicious-components'>
                                        Integrity Rating
                                    </NxTextLink>
                                </NxDescriptionList.Term>
                                <NxDescriptionList.Description>
                                    {popupContext.iq?.componentDetails.integrityRating}
                                </NxDescriptionList.Description>
                            </NxDescriptionList.Item>
                        )}
                        {popupContext.iq?.componentDetails.hygieneRating != null && (
                            <NxDescriptionList.Item>
                                <NxDescriptionList.Term>
                                    <NxTextLink
                                        external
                                        href='https://help.sonatype.com/iqserver/quickstart-guides/lifecycle-for-developers-quickstart#LifecycleforDevelopersQuickstart-HygieneRatings'>
                                        Hygiene Rating
                                    </NxTextLink>
                                </NxDescriptionList.Term>
                                <NxDescriptionList.Description>
                                    {popupContext.iq?.componentDetails.hygieneRating}
                                </NxDescriptionList.Description>
                            </NxDescriptionList.Item>
                        )}

                        {popupContext.iq?.componentDetails.projectData &&
                            popupContext.iq?.componentDetails.projectData.lastReleaseDate && (
                                <NxDescriptionList.Item>
                                    <NxDescriptionList.Term>Last Release Date</NxDescriptionList.Term>
                                    <NxDescriptionList.Description>
                                        {formatDate(
                                            new Date(popupContext.iq?.componentDetails.projectData?.lastReleaseDate)
                                        )}
                                    </NxDescriptionList.Description>
                                </NxDescriptionList.Item>
                            )}
                        {popupContext.iq?.componentDetails.projectData &&
                            popupContext.iq?.componentDetails.projectData.firstReleaseDate && (
                                <NxDescriptionList.Item>
                                    <NxDescriptionList.Term>First Release Date</NxDescriptionList.Term>
                                    <NxDescriptionList.Description>
                                        {formatDate(
                                            new Date(popupContext.iq?.componentDetails.projectData?.firstReleaseDate)
                                        )}
                                    </NxDescriptionList.Description>
                                </NxDescriptionList.Item>
                            )}

                        {popupContext.iq?.componentDetails.catalogDate != null && (
                            <NxDescriptionList.Item>
                                <NxTooltip
                                    placement='top'
                                    // className="gallery-tooltip-example"
                                    title={<>The date this component version was added to Nexus Intelligence</>}>
                                    <NxDescriptionList.Term>Catalog Date</NxDescriptionList.Term>
                                </NxTooltip>
                                <NxTooltip
                                    placement='top'
                                    // className="gallery-tooltip-example"
                                    title={<>{popupContext.iq?.componentDetails.catalogDate}</>}>
                                    <NxDescriptionList.Description>
                                        {formatDate(new Date(popupContext.iq?.componentDetails.catalogDate))}
                                    </NxDescriptionList.Description>
                                </NxTooltip>
                            </NxDescriptionList.Item>
                        )}
                    </NxDescriptionList>
                </section>
                <section className='nx-grid-col nx-grid-col--33'>
                    {popupContext.iq?.componentDetails?.policyData != undefined && (
                        <React.Fragment>
                            <GetPolicyViolationIndicator policyData={popupContext.iq.componentDetails.policyData} />
                            {popupContext.iq !== undefined && (
                                <NxList>
                                    <NxList.LinkItem
                                        href={`${iqServerUrl}/api/v2/search/advanced?query=componentHash%3A${popupContext.iq.componentDetails.component.hash}&page=0&allComponents=true
`}>
                                        Advanced Search Resuts
                                    </NxList.LinkItem>
                                </NxList>
                            )}
                        </React.Fragment>
                    )}
                </section>
            </div>
        </React.Fragment>
    )
}

export default function ComponentInfoPage() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqComponentInfo />}</div>
}
