/* eslint @typescript-eslint/no-var-requires: "off" */
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
import { Application, LogLevel, SecurityData, TestLogger } from '@sonatype/js-sona-types'
import React from 'react'
import renderer from 'react-test-renderer'
import { NexusContext } from '../../../context/ExtensionPopupContext'
import { DATA_SOURCES } from '../../../utils/Constants'
import SecurityThreat from './SecurityThreat'
const policyJson = require('./iq_server_policy_result.json')

const securityData: SecurityData = {
    securityIssues: [
        {
            id: 'test',
            source: 'cve',
            reference: 'reference',
            severity: 9.9,
            vector: 'vector',
            url: 'http://aurltosomewhere.com',
            description: 'test description',
        },
    ],
}

const component = {
    matchState: 'NONE',
    catalogDate: '',
    relativePopularity: '',
    licenseData: undefined,
    securityData: securityData,
    component: { packageUrl: 'pkg:npm/jquery@3.1.1', name: 'jquery', hash: '' },
}

describe('<SecurityThreat />', () => {
    test.skip('renders null when provided no context', () => {
        const comp = renderer.create(<SecurityThreat />)

        const tree = comp.toJSON()
        expect(tree).toMatchSnapshot()
    })

    test.skip('renders properly when provided Nexus IQ like context', () => {
        const comp = renderer.create(
            <NexusContext.Provider
                value={{
                    showAlpDrawer: false,
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    toggleAlpDrawer: () => {},
                    logger: new TestLogger(LogLevel.ERROR),
                    scanType: DATA_SOURCES.NEXUSIQ,
                    policyDetails: policyJson,
                    applications: new Set<Application>(),
                    currentUrl: new URL('about:blank'),
                }}>
                <SecurityThreat />
            </NexusContext.Provider>
        )

        const tree = comp.toJSON()
        expect(tree).toMatchSnapshot()
    })

    test.skip('renders properly when provided OSS Index like context', () => {
        const comp = renderer.create(
            <NexusContext.Provider
                value={{
                    showAlpDrawer: false,
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    toggleAlpDrawer: () => {},
                    logger: new TestLogger(LogLevel.ERROR),
                    scanType: DATA_SOURCES.OSSINDEX,
                    componentDetails: component,
                    applications: new Set<Application>(),
                    currentUrl: new URL('about:blank'),
                }}>
                <SecurityThreat />
            </NexusContext.Provider>
        )

        const tree = comp.toJSON()
        expect(tree).toMatchSnapshot()
    })
})
