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
import { ExtensionPopupContext } from '../../../../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../../../../context/ExtensionConfigurationContext'
import AllVersionsDetails from './AllVersionsDetails/AllVersionsDetails'
import { DATA_SOURCE } from '../../../../../utils/Constants'

function IqRemediationPageAllVersion() {
    const popupContext = useContext(ExtensionPopupContext)

    if (popupContext?.iq?.allVersions) {
        return (
            <React.Fragment>
                <NxH3>
                    All Versions <span className={'nx-counter'}>{popupContext?.iq?.allVersions.length}</span>
                </NxH3>
                <AllVersionsDetails />
            </React.Fragment>
        )
    } else {
        return (
            <React.Fragment>
                <em>No Additional Versions</em>
            </React.Fragment>
        )
    }
}

export default function RemediationPageAllVersion() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqRemediationPageAllVersion />}</div>
}
