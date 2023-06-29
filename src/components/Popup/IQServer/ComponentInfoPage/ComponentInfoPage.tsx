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
import { ExtensionPopupContext } from '../../../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../../../context/ExtensionConfigurationContext'
import { DATA_SOURCE } from '../../../../utils/Constants'
import './ComponentInfoPage.css'
import { ApiPolicyViolationDTOV2 } from '@sonatype/nexus-iq-api-client'
import { getMaxThreatLevelForPolicyViolations } from '../../../../types/Component'
import { LogLevel, logger } from '../../../../logger/Logger'

const formatDate = (date: Date | undefined | null): string => {
    if (date) {
        const dateTime = new Date(date)
        const noTime = dateTime.toUTCString().split(' ').slice(0, 4).join(' ')
        return noTime
    }
    return 'N/A'
}

function GetPolicyViolationsIndicator({ policyData, policyType }) {
    let filteredPolicies: ApiPolicyViolationDTOV2[] | undefined = []
    const policyTypes = ['Security', 'License', 'Architecture']

    if (policyType === 'All Policies') {
        filteredPolicies = policyData.policyViolations
    } else if (policyType === 'Other') {
        filteredPolicies = policyData.policyViolations?.filter(
            (policy) => policyTypes.some((type) => policy.policyName.includes(type)) == false
        )
    } else {
        filteredPolicies = policyData.policyViolations?.filter((policy) => policy.policyName?.includes(policyType))
    }

    const policyTypeLabel = policyType === 'Architecture' ? 'Quality' : policyType

    logger.logMessage(`GetPolicyViolationsIndicator for type: ${policyType} (${policyTypeLabel})`, LogLevel.DEBUG)

    if (filteredPolicies !== undefined && filteredPolicies.length > 0) {
        const maxPolicyThreatLevel = Math.round(
            getMaxThreatLevelForPolicyViolations(filteredPolicies)
        ) as ThreatLevelNumber
        const policyCount: string = filteredPolicies.length.toString()
        return (
            <React.Fragment>
                <NxList.Item>
                    <NxList.Text>
                        <NxPolicyViolationIndicator
                            style={{
                                width: '300px !important',
                                margin: 'none !important',
                            }}
                            policyThreatLevel={maxPolicyThreatLevel}>
                            {policyTypeLabel}
                        </NxPolicyViolationIndicator>
                        {policyType !== 'All Policies' && <span className={'nx-counter'}>{policyCount}</span>}
                    </NxList.Text>
                </NxList.Item>
            </React.Fragment>
        )
    }
    return <></>
}

function IqComponentInfo() {
    const popupContext = useContext(ExtensionPopupContext)

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
                                <NxTooltip title='Tooltip!'>
                                    <NxDescriptionList.Term>
                                        <NxTextLink
                                            external
                                            href='https://help.sonatype.com/iqserver/quickstart-guides/lifecycle-for-developers-quickstart#LifecycleforDevelopersQuickstart-HygieneRatings'>
                                            Hygiene Rating
                                        </NxTextLink>
                                    </NxDescriptionList.Term>
                                </NxTooltip>
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

                        {/* {popupContext.iq?.componentDetails.catalogDate != null && (
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
                                        {(popupContext.iq?.componentDetails.catalogDate as Date).toISOString()}
                                    </NxDescriptionList.Description>
                                </NxTooltip>
                            </NxDescriptionList.Item>
                        )} */}
                    </NxDescriptionList>
                </section>
                <section className='nx-grid-col nx-grid-col--33'>
                    {popupContext.iq?.componentDetails?.policyData != undefined && (
                        <React.Fragment>
                            {/* <GetPolicyAllViolationIndicator policyData={popupContext.iq.componentDetails.policyData} /> */}
                            {/* {popupContext.iq !== undefined && (
                                <>
                                    <h3 className={'nx-h3'}>Lifecycle Quick Links</h3>
                                    <NxTextLink
                                        href={`${iqServerUrl}/api/v2/search/advanced?query=componentHash%3A${popupContext.iq.componentDetails.component.hash}&page=0&allComponents=true`}
                                        external
                                    >
                                        Advanced Search Resuts
                                    </NxTextLink>
                                </>
                            )} */}
                            {popupContext.iq.componentDetails.policyData.policyViolations &&
                                popupContext.iq.componentDetails.policyData.policyViolations.length > 0 && (
                                    <React.Fragment>
                                        <header className='nx-grid-header'>
                                            <h3 className={'nx-h3'}>{`Max Policy Threat`}</h3>
                                        </header>
                                        <NxList emptyMessage='No policy violations found.'>
                                            <GetPolicyViolationsIndicator
                                                policyData={popupContext.iq.componentDetails.policyData}
                                                policyType={'All Policies'}
                                            />
                                            <GetPolicyViolationsIndicator
                                                policyData={popupContext.iq.componentDetails.policyData}
                                                policyType={'Security'}
                                            />
                                            <GetPolicyViolationsIndicator
                                                policyData={popupContext.iq.componentDetails.policyData}
                                                policyType={'License'}
                                            />
                                            <GetPolicyViolationsIndicator
                                                policyData={popupContext.iq.componentDetails.policyData}
                                                policyType={'Architecture'}
                                            />
                                            <GetPolicyViolationsIndicator
                                                policyData={popupContext.iq.componentDetails.policyData}
                                                policyType={'Other'}
                                            />
                                        </NxList>
                                    </React.Fragment>
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
