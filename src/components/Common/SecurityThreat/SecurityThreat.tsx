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
    NxH3,
    NxLoadingSpinner,
    NxPolicyViolationIndicator,
    ThreatLevelNumber,
} from '@sonatype/react-shared-components'
import React, { useContext } from 'react'
import { ExtensionPopupContext } from '../../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../../context/ExtensionConfigurationContext'
import { DATA_SOURCE } from '../../../utils/Constants'

function IqSecurity() {
    const popupContext = useContext(ExtensionPopupContext)
    const securityData = popupContext.iq?.componentDetails?.securityData

    function getMaxSecurity() {
        if (securityData && securityData.securityIssues && securityData?.securityIssues?.length > 0) {
            return Math.max(...securityData.securityIssues.map((issue) => issue.severity as number))
        }

        return 0
    }

    if (securityData == undefined) {
        return <NxLoadingSpinner />
    } else {
        return (
            <React.Fragment>
                <header className='nx-grid-header'>
                    <NxH3 className={'nx-h3'}>Max Security Threat</NxH3>
                </header>
                <NxPolicyViolationIndicator policyThreatLevel={getMaxSecurity() as ThreatLevelNumber} />
            </React.Fragment>
        )
    }
}

export default function SecurityThreat() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqSecurity />}</div>
}
