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

import React, { useContext } from 'react'
import { ExtensionPopupContext } from '../../../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../../../context/ExtensionConfigurationContext'
import './PolicyPage.css'
import PolicyViolation from './PolicyViolation/PolicyViolation'
import { DATA_SOURCE } from '../../../../utils/Constants'
import { NxLoadingSpinner } from '@sonatype/react-shared-components'
import { ApiPolicyViolationDTOV2 } from '@sonatype/nexus-iq-api-client'

function IqPolicyPage() {
    const popupContext = useContext(ExtensionPopupContext)
    const extensionContext = useContext(ExtensionConfigurationContext)
    const policyData = popupContext.iq?.componentDetails?.policyData
    const violationCount = policyData?.policyViolations ? policyData.policyViolations?.length : 0

    if (violationCount <= 0) {
        return <NxLoadingSpinner />
    }
    return (
        <React.Fragment>
            <div className='nx-grid-row'>
                <section className='nx-grid-col nx-grid-col--100 nx-scrollable'>
                    <table className='nx-table'>
                        <thead>
                            <tr className='nx-table-row nx-table-row--header'>
                                <th className='nx-cell nx-cell--header nx-cell--num'>Threat</th>
                                <th className='nx-cell nx-cell--header'>Policy</th>
                                <th className='nx-cell nx-cell--header'>Constraint Name</th>
                                <th className='nx-cell nx-cell--header'>Condition</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policyData?.policyViolations
                                ?.sort((a: ApiPolicyViolationDTOV2, b: ApiPolicyViolationDTOV2) => {
                                    return (b.threatLevel as number) > (a.threatLevel as number) ? 1 : -1
                                })
                                .map((violation, index) => {
                                    return (
                                        <PolicyViolation
                                            key={`violation${index}`}
                                            policyViolation={violation}
                                            iqServerUrl={extensionContext.host as string}
                                        ></PolicyViolation>
                                    )
                                })}
                        </tbody>
                    </table>
                </section>
            </div>
        </React.Fragment>
    )
}

export default function PolicyPage() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqPolicyPage />}</div>
}
