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
import { NxTable, NxThreatIndicator, ThreatLevelCategory } from '@sonatype/react-shared-components'
import * as React from 'react'
import '../SecurityPage.css'
import { ApiSecurityIssueDTO } from '@sonatype/nexus-iq-api-client'
import { ExtensionConfigurationContext } from '../../../../../context/ExtensionConfigurationContext'
import { stripTrailingSlash } from '../../../../../utils/Helpers'

type SecurityItemProps = {
    securityIssue: ApiSecurityIssueDTO
    open: boolean
    packageUrl: string
    remediationEvent: (vulnID: string) => void
}

export function IqSecurityItemDisplay(props: SecurityItemProps) {
    const extensionContext = React.useContext(ExtensionConfigurationContext)
    const iqServerUrl = stripTrailingSlash(extensionContext.host as string)
    const cveUrl = `${iqServerUrl}/assets/index.html#/vulnerabilities/${props.securityIssue.reference}`

    return (
        <NxTable.Row
            isClickable
            className='nx-table-row'
            key={`row-${props.securityIssue.reference}`}
            onClick={() => window.open(cveUrl, '_blank')}>
            <React.Fragment key={props.securityIssue.reference}>
                <NxTable.Cell className='nx-cell'>
                    <NxThreatIndicator
                        threatLevelCategory={props.securityIssue.threatCategory as ThreatLevelCategory}
                    />
                    <span>{props.securityIssue.severity}</span>
                </NxTable.Cell>
                <NxTable.Cell className='nx-cell'>{props.securityIssue.reference}</NxTable.Cell>
                <NxTable.Cell chevron />
            </React.Fragment>
        </NxTable.Row>
    )
}
