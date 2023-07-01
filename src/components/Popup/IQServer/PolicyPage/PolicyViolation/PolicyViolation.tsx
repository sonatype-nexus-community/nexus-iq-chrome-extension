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

import { NxList, NxPolicyViolationIndicator, NxTextLink, ThreatLevelNumber } from '@sonatype/react-shared-components'
import React from 'react'
import '../PolicyPage.css'
import {
    ApiConstraintViolationDTO,
    ApiConstraintViolationReasonDTO,
    ApiPolicyViolationDTOV2,
} from '@sonatype/nexus-iq-api-client'

type PolicyViolationProps = {
    policyViolation: ApiPolicyViolationDTOV2
    iqServerUrl: string
}

const PolicyViolation = (props: PolicyViolationProps): JSX.Element | null => {
    const formatReason = (reason: string, iqServerUrl: string) => {
        iqServerUrl = iqServerUrl.endsWith('/') ? iqServerUrl.slice(0, -1) : iqServerUrl
        const CVERegex = /((?:CVE|sonatype)-[0-9]{4}-[0-9]+)/g
        return reason.split(CVERegex).map((segment, index) =>
            CVERegex.exec(segment) ? (
                // eslint-disable-next-line react/jsx-key
                <NxTextLink
                    key={`textLink${index}`}
                    external
                    href={`${iqServerUrl}/assets/index.html#/vulnerabilities/${segment}`}>
                    {segment}
                </NxTextLink>
            ) : (
                segment
            )
        )
    }

    const printPolicyViolation = (policyViolation: ApiPolicyViolationDTOV2, iqServerUrl: string) => {
        return (
            <tr className='nx-table-row'>
                <td className='nx-cell'>
                    <NxPolicyViolationIndicator
                        style={{
                            width: '10px !important',
                            margin: 'none !important',
                        }}
                        policyThreatLevel={policyViolation.threatLevel as ThreatLevelNumber}>
                        {policyViolation?.threatLevel?.toString()}
                    </NxPolicyViolationIndicator>
                </td>
                {policyViolation?.constraintViolations?.map((constraint: ApiConstraintViolationDTO, index) => (
                    <React.Fragment key={`constraint${index}`}>
                        <td className='nx-cell'>{policyViolation.policyName}</td>
                        <td className='nx-cell'>{constraint.constraintName}</td>
                        <td className='nx-cell'>
                            {/* {constraint.reasons.map((reason: Reason) => ( */}
                            <NxList>
                                {constraint.reasons?.map((reason: ApiConstraintViolationReasonDTO, index) => (
                                    // eslint-disable-next-line react/jsx-key
                                    <NxList.Item key={`policy${index}`} className='nx-list-in-cell'>
                                        <NxList.Text>
                                            {formatReason(
                                                reason.reason !== undefined ? reason.reason : '',
                                                iqServerUrl
                                            )}
                                        </NxList.Text>
                                    </NxList.Item>
                                ))}
                            </NxList>
                            {/* ))} */}
                        </td>
                    </React.Fragment>
                ))}
            </tr>
        )
    }

    return printPolicyViolation(props.policyViolation, props.iqServerUrl)
}

export default PolicyViolation
