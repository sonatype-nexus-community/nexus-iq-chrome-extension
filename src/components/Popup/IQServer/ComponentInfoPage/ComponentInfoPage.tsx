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
import { PolicyData } from '@sonatype/js-sona-types'
import {
    NxDescriptionList,
    NxLoadingSpinner,
    NxPolicyViolationIndicator,
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

// const ComponentInfoPage = (): JSX.Element | null => {
//   const nexusContext = useContext(NexusContext);
//
//   const formatDate = (date: Date | undefined | null): string => {
//     if (date) {
//       const dateTime = new Date(date);
//       const noTime = dateTime.toUTCString().split(' ').slice(0, 4).join(' ');
//       return noTime;
//     }
//     return 'N/A';
//   };
//

function GetPolicyViolationIndicator({ policyData }: { policyData: ApiComponentPolicyViolationListDTOV2 }) {
    const violationCount = policyData.policyViolations ? policyData.policyViolations?.length : 0

    function getMaxViolation() {
        if (
            policyData.policyViolations &&
            policyData.policyViolations.length > 0 &&
            violationCount &&
            violationCount > 0
        ) {
            return Math.max(
                ...policyData.policyViolations.map((violation) =>
                    violation.threatLevel != undefined ? violation.threatLevel : 0
                )
            )
        }
        return 0
    }

    return (
        <React.Fragment>
            <header className='nx-grid-header'>
                <h3 className={'nx-h3'}>Max Policy Violation</h3>
            </header>
            <NxPolicyViolationIndicator
                style={{ marginBottom: '16px !important' }}
                policyThreatLevel={Math.round(getMaxViolation()) as ThreatLevelNumber}
            ></NxPolicyViolationIndicator>
        </React.Fragment>
    )
}

function IqComponentInfo() {
    const popupContext = useContext(ExtensionPopupContext)
    if (popupContext.iq?.componentDetails?.component?.displayName == undefined) {
        return <NxLoadingSpinner />
    }
    return (
        <React.Fragment>
            <div className='nx-grid-row'>
                <section className='nx-grid-col nx-grid-col--67 nx-scrollable'>
                    <header className='nx-grid-header'>
                        <NxTooltip
                            placement='top'
                            title={<>{popupContext.iq?.componentDetails?.component?.displayName}</>}
                        >
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
                                undefined && (
                                <NxDescriptionList.Item>
                                    <NxDescriptionList.Term>Project</NxDescriptionList.Term>
                                    <NxDescriptionList.Description>
                                        {popupContext.iq?.componentDetails.projectData?.projectMetadata.organization}
                                    </NxDescriptionList.Description>
                                </NxDescriptionList.Item>
                            )}
                    </NxDescriptionList>
                </section>
                <section className='nx-grid-col nx-grid-col--33'>
                    {popupContext.iq?.componentDetails?.policyData != undefined && (
                        <React.Fragment>
                            <GetPolicyViolationIndicator policyData={popupContext.iq.componentDetails.policyData} />
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
