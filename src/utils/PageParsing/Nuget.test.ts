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
import { readFileSync } from 'fs'
import { join } from 'path'
import { REPOS, REPO_TYPES } from '../Constants'
import { getArtifactDetailsFromDOM } from '../PageParsing'
import { ensure } from '../Helpers'

describe('Nuget Page Parsing', () => {
    const repoType = REPO_TYPES.find((e) => e.repoID == REPOS.nugetOrg)
    expect(repoType).toBeDefined()

    test('Should parse Nuget page /Newtonsoft.Json', () => {
        const html = readFileSync(join(__dirname, 'testdata/nuget.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(ensure(repoType), 'https://www.nuget.org/packages/Newtonsoft.Json')

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe('nuget')
        expect(PackageURL?.name).toBe('Newtonsoft.Json')
        expect(PackageURL?.version).toBe('13.0.1')
    })

    test('Should parse Nuget page /Newtonsoft.Json/13.0.3', () => {
        const html = readFileSync(join(__dirname, 'testdata/nuget.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://www.nuget.org/packages/Newtonsoft.Json/13.0.3'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe('nuget')
        expect(PackageURL?.name).toBe('Newtonsoft.Json')
        expect(PackageURL?.version).toBe('13.0.3')
    })

    test('Should parse Nuget page /Newtonsoft.Json/13.0.3/', () => {
        const html = readFileSync(join(__dirname, 'testdata/nuget.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://www.nuget.org/packages/Newtonsoft.Json/13.0.3/'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe('nuget')
        expect(PackageURL?.name).toBe('Newtonsoft.Json')
        expect(PackageURL?.version).toBe('13.0.3')
    })

    test('Should parse Nuget page /Newtonsoft.Json/12.0.0?query#fragment', () => {
        const html = readFileSync(join(__dirname, 'testdata/nuget.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://www.nuget.org/packages/Newtonsoft.Json/12.0.0'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe('nuget')
        expect(PackageURL?.name).toBe('Newtonsoft.Json')
        expect(PackageURL?.version).toBe('12.0.0')
    })
})
