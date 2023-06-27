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
import { NxH3 } from '@sonatype/react-shared-components'
import React, { useContext } from 'react'
import { ExtensionPopupContext } from '../../../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../../../context/ExtensionConfigurationContext'
import AllVersionsDetails from './AllVersionsPage/AllVersionsDetails/AllVersionsDetails'
import RemediationDetails from './RemediationDetails/RemediationDetails'
import { DATA_SOURCE } from '../../../../utils/Constants'

function IqRemediationPage() {
    const popupContext = useContext(ExtensionPopupContext)
    const versionChanges = popupContext.iq?.remediationDetails?.remediation?.versionChanges

    return (
        <React.Fragment>
            <div className='nx-grid-row'>
                <section className='nx-grid-col nx-grid-col--33 nx-scrollable'>
                    {versionChanges && versionChanges.length > 0 && <NxH3>Recommended Versions</NxH3>}
                    <RemediationDetails />
                </section>
                <section className='nx-grid-col nx-grid-col--67 nx-scrollable'>
                    <NxH3>All Versions ({popupContext.iq?.allVersions?.length})</NxH3>
                    <AllVersionsDetails />
                </section>
            </div>
        </React.Fragment>
    )
}

export default function RemediationPage() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqRemediationPage />}</div>
}
