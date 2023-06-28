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
import { FORMATS, REPOS, REPO_TYPES } from '../Constants'
import { ensure } from '../Helpers'
import { getArtifactDetailsFromDOM } from '../PageParsing'

describe('Ruby Gems Page Parsing', () => {
    const repoType = REPO_TYPES.find((e) => e.repoID == REPOS.rubyGemsOrg)
    expect(repoType).toBeDefined()

    test('should parse a valid RubyGems page', () => {
        const html = readFileSync(join(__dirname, 'testdata/rubygems.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(ensure(repoType), 'https://rubygems.org/gems/chelsea')

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe(FORMATS.gem)
        expect(PackageURL?.name).toBe('chelsea')
        expect(PackageURL?.version).toBe('0.0.35')
    })

    test('should parse a valid RubyGems page with QS and Fragment', () => {
        const html = readFileSync(join(__dirname, 'testdata/rubygems.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://rubygems.org/gems/chelsea?some=thing#anchor'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe(FORMATS.gem)
        expect(PackageURL?.name).toBe('chelsea')
        expect(PackageURL?.version).toBe('0.0.35')
    })

    test('should parse a valid RubyGems page with version', () => {
        const html = readFileSync(join(__dirname, 'testdata/rubygems.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://rubygems.org/gems/chelsea/versions/0.0.32'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe(FORMATS.gem)
        expect(PackageURL?.name).toBe('chelsea')
        expect(PackageURL?.version).toBe('0.0.32')
    })

    test('should parse a valid RubyGems page with version with QS and Fragment', () => {
        const html = readFileSync(join(__dirname, 'testdata/rubygems.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://rubygems.org/gems/chelsea/versions/0.0.32?some=thing#anchor'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe(FORMATS.gem)
        expect(PackageURL?.name).toBe('chelsea')
        expect(PackageURL?.version).toBe('0.0.32')
    })
})
