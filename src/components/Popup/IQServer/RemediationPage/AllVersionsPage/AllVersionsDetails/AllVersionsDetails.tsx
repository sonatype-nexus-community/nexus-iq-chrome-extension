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
    NxGrid,
    NxList,
    NxLoadingSpinner,
    NxMeter,
    NxPolicyViolationIndicator,
    ThreatLevelNumber,
} from '@sonatype/react-shared-components'
import { PackageURL } from 'packageurl-js'
import React, { useContext, useEffect, useRef } from 'react'
import { ExtensionPopupContext } from '../../../../../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../../../../../context/ExtensionConfigurationContext'
import './AllVersionsDetails.css'
import { DATA_SOURCE } from '../../../../../../utils/Constants'
import { ApiComponentPolicyViolationListDTOV2 } from '@sonatype/nexus-iq-api-client'
import { getNewUrlandGo } from '../../../../../../utils/Helpers'
import { Tooltip, withStyles } from '@material-ui/core'

function IqAllVersionDetails() {
    const popupContext = useContext(ExtensionPopupContext)
    const allVersions = popupContext.iq?.allVersions
    const currentPurl = popupContext.currentPurl
    const currentVersionRef = useRef<HTMLElement>(null)

    function getMaxViolation(policyData: ApiComponentPolicyViolationListDTOV2) {
        if (policyData.policyViolations && policyData.policyViolations.length > 0) {
            return Math.max(
                ...policyData.policyViolations.map((violation) =>
                    violation.threatLevel != undefined ? violation.threatLevel : 0
                )
            )
        }
        return 0
    }

    useEffect(() => {
        if (currentVersionRef.current) {
            currentVersionRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            })
        }
    }, [allVersions])

    const VersionTooltip = withStyles((theme) => ({
        tooltip: {
            backgroundColor: theme.palette.common.white,
            color: 'black',
            boxShadow: theme.shadows[1],
            fontSize: 12,
        },
    }))(Tooltip)

    function calculateAge(catalogDate) {
        // birthday is a date
        const ageDifMs = Date.now() - catalogDate
        const ageDate = new Date(ageDifMs) // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970)
    }

    if (allVersions) {
        // if (allVersions && currentPurl) {
        return (
            <NxList id='all-versions-list'>
                {allVersions.map((version) => {
                    const versionPurl = PackageURL.fromString(version.component?.packageUrl as string)

                    return (
                        <NxList.LinkItem
                            href=''
                            key={version.component?.packageUrl}
                            selected={versionPurl.version == currentPurl?.version}>
                            <NxList.Text
                                onClick={() =>
                                    getNewUrlandGo(
                                        popupContext.currentTab,
                                        currentPurl?.version as string,
                                        versionPurl.version as string
                                    )
                                }
                                ref={currentPurl?.version == versionPurl.version ? currentVersionRef : null}>
                                <NxGrid.Row
                                    style={{
                                        marginTop: '0px',
                                        marginBottom: '0px',
                                    }}>
                                    <NxGrid.Column className='nx-grid-col-50'>
                                        {version.policyData != undefined && (
                                            <VersionTooltip
                                                title={
                                                    <React.Fragment>
                                                        {/* <Typography color='inherit'>Tooltip with HTML</Typography> */}
                                                        {`Total Policy Violation Count: ${version.policyData.policyViolations?.length}`}
                                                        <br />
                                                        {`Security Vulnerabilities (CVE): ${version.securityData?.securityIssues?.length}`}
                                                        <br />
                                                        {`Age: ${calculateAge(version.catalogDate)} Year(s)`}
                                                    </React.Fragment>
                                                }>
                                                {/* // title={`Policy Violation Count: ${version.policyData.policyViolations?.length}<br/>Security Vulnerabilities: ${version.securityData?.securityIssues?.length}`}> */}
                                                <NxPolicyViolationIndicator
                                                    style={{ marginBottom: '16px !important' }}
                                                    policyThreatLevel={
                                                        Math.round(
                                                            getMaxViolation(version.policyData)
                                                        ) as ThreatLevelNumber
                                                    }>
                                                    {versionPurl.version}
                                                </NxPolicyViolationIndicator>
                                            </VersionTooltip>
                                        )}
                                    </NxGrid.Column>
                                    {version.relativePopularity !== undefined && (
                                        <NxGrid.Column className='nx-grid-col-50'>
                                            <Tooltip title={`Popularity: ${version.relativePopularity}`}>
                                                <NxMeter
                                                    value={version.relativePopularity as number}
                                                    max={100}
                                                    children={''}
                                                    style={{
                                                        color: 'rgb(139, 199, 62) !important',
                                                        // marginTop: '0px',
                                                    }}
                                                />
                                            </Tooltip>
                                        </NxGrid.Column>
                                    )}
                                </NxGrid.Row>
                            </NxList.Text>
                        </NxList.LinkItem>
                    )
                })}
            </NxList>
        )
    } else {
        // return <>{/* <span>{currentPurl?.name}</span> */}</>
        return <NxLoadingSpinner />
    }
}

export default function AllVersionDetails() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqAllVersionDetails />}</div>
}
