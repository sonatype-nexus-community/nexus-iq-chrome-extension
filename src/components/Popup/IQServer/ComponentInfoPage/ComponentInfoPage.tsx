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
    NxLoadingSpinner,
    NxPolicyViolationIndicator,
    NxTextLink,
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
            (policy) => !policyTypes.some((excludeItem) => policy.policyName.includes(excludeItem))
        )
        // string does not include each any values in another array
        // policyTypes.some((type) => !policy.policyName.includes(type))
    } else {
        filteredPolicies = policyData.policyViolations?.filter((policy) => policy.policyName?.includes(policyType))
    }
    logger.logMessage(`filtered policies for type: ${policyType}`, LogLevel.DEBUG, filteredPolicies)

    const policyTypeLabel = policyType === 'Architecture' ? 'Quality' : policyType

    logger.logMessage(`GetPolicyViolationsIndicator for type: ${policyType} (${policyTypeLabel})`, LogLevel.DEBUG)

    if (filteredPolicies !== undefined && filteredPolicies.length > 0) {
        const maxPolicyThreatLevel = Math.round(
            getMaxThreatLevelForPolicyViolations(filteredPolicies)
        ) as ThreatLevelNumber
        // const policyCount: string = filteredPolicies.length.toString()
        // const label = `${maxPolicyThreatLevel.toString()} ${policyTypeLabel}`
        return (
            <React.Fragment>
                <section className='nx-card nx-card--equal' aria-label={policyTypeLabel}>
                    <div className='nx-card__content'>
                        <div className='nx-card__call-out'>
                            <NxPolicyViolationIndicator
                                style={{
                                    width: '10px !important',
                                    margin: 'none !important',
                                }}
                                policyThreatLevel={maxPolicyThreatLevel as ThreatLevelNumber}>
                                {maxPolicyThreatLevel.toString()}
                            </NxPolicyViolationIndicator>
                        </div>
                    </div>
                    <footer className='nx-card__footer'>{policyTypeLabel}</footer>
                </section>
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
            <section className='nx-tile'>
                <header className='nx-tile-header'>
                    <div className='nx-tile-header__title'>
                        <h3 className='nx-h2'>{popupContext.iq?.componentDetails?.component?.displayName}</h3>
                    </div>
                </header>
                <div className='nx-grid-row'>
                    <div className='nx-grid-col nx-grid-col--67'>
                        <dl>
                            {popupContext.iq?.componentDetails?.component?.hash != null && (
                                <div className='nx-read-only__item'>
                                    {/* <dt className='nx-read-only__label'>Hash</dt> */}
                                    <dd className='nx-read-only__data'>
                                        {popupContext.iq?.componentDetails?.component?.hash}
                                    </dd>
                                </div>
                            )}
                            <div className='nx-grid-row'>
                                <div className='nx-grid-col'>
                                    {popupContext.iq?.componentDetails.integrityRating != null && (
                                        <div className='nx-read-only__item'>
                                            <dt className='nx-read-only__label'>
                                                <NxTextLink
                                                    external
                                                    href='https://help.sonatype.com/fw/next-gen-firewall-features/protection-from-pending-and-suspicious-components'>
                                                    Integrity Rating
                                                </NxTextLink>
                                            </dt>
                                            <dd className='nx-read-only__data'>
                                                {' '}
                                                {popupContext.iq?.componentDetails.integrityRating}
                                            </dd>
                                        </div>
                                    )}
                                    {popupContext.iq?.componentDetails.hygieneRating != null && (
                                        <div className='nx-read-only__item'>
                                            <dt className='nx-read-only__label'>
                                                <NxTextLink
                                                    external
                                                    href='https://help.sonatype.com/iqserver/quickstart-guides/lifecycle-for-developers-quickstart#LifecycleforDevelopersQuickstart-HygieneRatings'>
                                                    Hygiene Rating
                                                </NxTextLink>
                                            </dt>
                                            <dd className='nx-read-only__data'>
                                                {popupContext.iq?.componentDetails.hygieneRating}
                                            </dd>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </dl>
                    </div>

                    {popupContext.iq?.componentDetails.projectData &&
                        (popupContext.iq?.componentDetails.projectData.lastReleaseDate ||
                            popupContext.iq?.componentDetails.projectData.firstReleaseDate) && (
                            <div className='nx-grid-col nx-grid-col--33'>
                                <dl>
                                    {popupContext.iq?.componentDetails.projectData.lastReleaseDate && (
                                        <div className='nx-read-only__item'>
                                            <dt className='nx-read-only__label'>Last Release Date</dt>
                                            <dd className='nx-read-only__data'>
                                                {formatDate(
                                                    new Date(
                                                        popupContext.iq?.componentDetails.projectData?.lastReleaseDate
                                                    )
                                                )}
                                            </dd>
                                        </div>
                                    )}
                                    {popupContext.iq?.componentDetails.projectData.firstReleaseDate && (
                                        <div className='nx-read-only__item'>
                                            <dt className='nx-read-only__label'>First Release Date</dt>
                                            <dd className='nx-read-only__data'>
                                                {formatDate(
                                                    new Date(
                                                        popupContext.iq?.componentDetails.projectData?.firstReleaseDate
                                                    )
                                                )}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}
                </div>
            </section>
            {popupContext.iq.componentDetails.policyData &&
                popupContext.iq.componentDetails.policyData.policyViolations &&
                popupContext.iq.componentDetails.policyData.policyViolations.length > 0 && (
                    <React.Fragment>
                        <hr className='nx-grid-h-keyline' />
                        <header className='nx-grid-header' id='max-policy-header'>
                            <h4 className='nx-h3 nx-grid-header__title'>Highest Policy Threat Levels</h4>
                        </header>
                        <div className='nx-grid-row popup-content-row' id='max-policy-content'>
                            <div className='nx-card-container'>
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
                            </div>
                        </div>
                    </React.Fragment>
                )}
        </React.Fragment>
    )
}

export default function ComponentInfoPage() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqComponentInfo />}</div>
}
