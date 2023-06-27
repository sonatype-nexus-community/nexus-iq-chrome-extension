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
import { describe, expect, test } from '@jest/globals'
import React from 'react'
import renderer from 'react-test-renderer'
import { ExtensionPopupContext, getDefaultPopupContext } from '../../../context/ExtensionPopupContext'
import { DATA_SOURCE } from '../../../utils/Constants'
import LicenseThreat from './LicenseThreat'

// const licenseDetail: IqServerLicenseLegalMetadataResult = {
//     component: {
//         packageUrl: 'pkg:npm/jquery@3.1.1',
//         hash: 'browns',
//         displayName: 'jquery : 3.1.1',
//         componentIdentifier: {
//             format: 'npm',
//         },
//         licenseLegalData: {
//             declaredLicenses: ['MIT'],
//             observedLicenses: ['Not-Supported'],
//             effectiveLicenses: ['MIT'],
//             highestEffectiveLicenseThreatGroup: {
//                 licenseThreatGroupCategory: 'liberal',
//                 licenseThreatGroupLevel: 0,
//                 licenseThreatGroupName: 'group',
//             },
//             copyrights: [{ id: 1, content: 'MIT LICENSE', originalContentHash: 'hash', status: 'Hello' }],
//             licenseFiles: [{ id: 1, content: 'MIT LICENSE', originalContentHash: 'hash', status: 'Hello' }],
//             noticeFiles: [{ id: 1, content: 'MIT LICENSE', originalContentHash: 'hash', status: 'Hello' }],
//             obligations: [{ name: 'obligation 1', status: 'hello' }],
//         },
//     },
//     licenseLegalMetadata: [
//         {
//             licenseId: 'MIT',
//             licenseName: 'MIT',
//             licenseText: 'MIT LICENSE TEXT',
//             obligations: [{ name: 'obligation 1', obligationTexts: ['You are herefor obligated'] }],
//         },
//     ],
// }

describe('<LicenseThreat />', () => {
    test.skip('renders null when provided no context values', () => {
        const component = renderer.create(<LicenseThreat />)

        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
    })

    test.skip('renders properly when provided AWESOME context', () => {
        const component = renderer.create(
            <ExtensionPopupContext.Provider value={getDefaultPopupContext(DATA_SOURCE.NEXUSIQ)}>
                <LicenseThreat />
            </ExtensionPopupContext.Provider>
        )

        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
    })
})
