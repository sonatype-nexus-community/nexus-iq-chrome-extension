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
import React from 'react'
import renderer from 'react-test-renderer'
import { ExtensionPopupContext, getDefaultPopupContext } from '../../../context/ExtensionPopupContext'
import { DATA_SOURCE } from '../../../utils/Constants'
import SecurityThreat from './SecurityThreat'

describe('<SecurityThreat />', () => {
    test.skip('renders null when provided no context', () => {
        const comp = renderer.create(<SecurityThreat />)

        const tree = comp.toJSON()
        expect(tree).toMatchSnapshot()
    })

    test.skip('renders properly when provided Nexus IQ like context', () => {
        const comp = renderer.create(
            <ExtensionPopupContext.Provider value={getDefaultPopupContext(DATA_SOURCE.NEXUSIQ)}>
                <SecurityThreat />
            </ExtensionPopupContext.Provider>
        )

        const tree = comp.toJSON()
        expect(tree).toMatchSnapshot()
    })

    test.skip('renders properly when provided OSS Index like context', () => {
        const comp = renderer.create(
            <ExtensionPopupContext.Provider value={getDefaultPopupContext(DATA_SOURCE.OSSINDEX)}>
                <SecurityThreat />
            </ExtensionPopupContext.Provider>
        )

        const tree = comp.toJSON()
        expect(tree).toMatchSnapshot()
    })
})
