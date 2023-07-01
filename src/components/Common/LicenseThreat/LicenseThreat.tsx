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
// import { ExtensionPopupContext } from '../../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../../context/ExtensionConfigurationContext'
import { DATA_SOURCE } from '../../../utils/Constants'

function LicenseThreatIndicator() {
    // const popupContext = useContext(ExtensionPopupContext)

    return (
        <React.Fragment>
            <header className='nx-grid-header'>
                <h3 className={'nx-h3 nx-grid-header__title'}>Max License Threat</h3>
            </header>
            <span>Need license details from somewhere</span>
            {/*<NxPolicyViolationIndicator*/}
            {/*    policyThreatLevel={Math.round(threatGroupLevel) as ThreatLevelNumber}*/}
            {/*>*/}
            {/*    {threatGroupName}*/}
            {/*</NxPolicyViolationIndicator>*/}
        </React.Fragment>
    )

    // const renderLicenseThreat = (nexusContext: NexusContextInterface | undefined) => {
    //     if (nexusContext && nexusContext.getLicenseDetails && nexusContext.componentDetails &&
    //         !nexusContext.licenseDetails) {
    //         nexusContext.getLicenseDetails(nexusContext.componentDetails?.component.packageUrl)
    //     }
    //   if (nexusContext && nexusContext.licenseDetails) {
    //     return getLicenseThreat(
    //       nexusContext.licenseDetails.component.licenseLegalData.highestEffectiveLicenseThreatGroup
    //         .licenseThreatGroupLevel,
    //       nexusContext.licenseDetails.component.licenseLegalData.highestEffectiveLicenseThreatGroup
    //         .licenseThreatGroupName
    //     );
    //   } else {
    //     return <NxLoadingSpinner />;
    //   }
    // };
}

export default function LicenseThreat() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <LicenseThreatIndicator />}</div>
}
