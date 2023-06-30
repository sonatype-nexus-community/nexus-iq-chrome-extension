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

import React, { useContext, useState } from 'react'
import { ExtensionPopupContext } from '../../../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../../../context/ExtensionConfigurationContext'
import { IqSecurityItemDisplay } from './SecurityItemDisplay/SecurityItemDisplay'
import './SecurityPage.css'
import { DATA_SOURCE } from '../../../../utils/Constants'
import { ApiSecurityIssueDTO } from '@sonatype/nexus-iq-api-client'
import { sortSecurityIssues, SecurityIssue } from '../../../../types/ArtifactMessage'
import { NxTable, NxThreatIndicatorLegend } from '@sonatype/react-shared-components'

function IqSecurityPage() {
    const popupContext = useContext(ExtensionPopupContext)
    const [open, setOpen] = useState('')

    const getRemediationAndOpen = (securityIssue: string): void => {
        if (open == securityIssue) {
            setOpen('')
        } else {
            setOpen(securityIssue)
        }
    }

    const isOpen = (issue: string): boolean => {
        return issue == open
    }

    const sortedIssues: SecurityIssue[] = sortSecurityIssues(
        popupContext.iq?.componentDetails?.securityData?.securityIssues as SecurityIssue[]
    )

    return (
        <React.Fragment>
            <div className='nx-grid-row'>
                <section className='nx-grid-col nx-grid-col--25'>
                    <NxThreatIndicatorLegend vertical critical severe moderate low />
                </section>
                <section className='nx-grid-col nx-grid-col--75 nx-scrollable'>
                    <NxTable className='nx-table'>
                        <NxTable.Head>
                            <NxTable.Row isClickable className='nx-table-row nx-table-row--header'>
                                {/*<th className="nx-cell nx-cell--header nx-cell--num">Threat</th>*/}
                                <NxTable.Cell>CVSS</NxTable.Cell>
                                <NxTable.Cell>Issue</NxTable.Cell>
                                <NxTable.Cell chevron />
                            </NxTable.Row>
                        </NxTable.Head>
                        <NxTable.Body>
                            {sortedIssues.map((issue: ApiSecurityIssueDTO) => {
                                return (
                                    <IqSecurityItemDisplay
                                        key={issue.reference}
                                        open={isOpen(issue.reference as string)}
                                        packageUrl={popupContext.currentPurl?.toString() as string}
                                        securityIssue={issue}
                                        remediationEvent={getRemediationAndOpen}
                                    />
                                )
                            })}
                        </NxTable.Body>
                    </NxTable>
                </section>
            </div>
            {/*<div className="nx-grid-row">*/}
            {/*  <section className="nx-grid-col nx-grid-col--100 nx-scrollable">*/}
            {/*    {securityData?.securityIssues?.map((issue: ApiSecurityIssueDTO) => {*/}
            {/*      return (*/}
            {/*        <IqSecurityItemDisplay*/}
            {/*          key={issue.reference}*/}
            {/*          open={isOpen(issue.reference as string)}*/}
            {/*          packageUrl={popupContext.currentPurl?.toString() as string}*/}
            {/*          securityIssue={issue}*/}
            {/*          remediationEvent={getRemediationAndOpen}*/}
            {/*          threatLevelCategory={issue.threatCategory}*/}
            {/*        />*/}
            {/*      )*/}
            {/*    })}*/}
            {/*  </section>*/}
            {/*</div>*/}
        </React.Fragment>
    )
}

export default function SecurityPage() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqSecurityPage />}</div>
}
