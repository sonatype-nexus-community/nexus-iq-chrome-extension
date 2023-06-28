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
import { ensure } from '../Helpers'
import { getArtifactDetailsFromDOM } from '../PageParsing'

describe('Packagist Page Parsing', () => {
    const repoType = REPO_TYPES.find((e) => e.repoID == REPOS.packagistOrg)
    expect(repoType).toBeDefined()

    test('should parse a valid Packagist page', () => {
        const html = readFileSync(join(__dirname, 'testdata/packagist.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://packagist.org/packages/fomvasss/laravel-its-lte'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe('composer')
        expect(PackageURL?.namespace).toBe('fomvasss')
        expect(PackageURL?.name).toBe('laravel-its-lte')
        expect(PackageURL?.version).toBe('4.23.0')
    })

    test('should parse a valid Packagist page, specific version', () => {
        const html = readFileSync(join(__dirname, 'testdata/packagist.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://packagist.org/packages/fomvasss/laravel-its-lte#4.22'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe('composer')
        expect(PackageURL?.namespace).toBe('fomvasss')
        expect(PackageURL?.name).toBe('laravel-its-lte')
        expect(PackageURL?.version).toBe('4.22')
    })

    test('should parse a valid Packagist page, specific version with query string', () => {
        const html = readFileSync(join(__dirname, 'testdata/packagist.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://packagist.org/packages/fomvasss/laravel-its-lte?some=thing#4.22'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe('composer')
        expect(PackageURL?.namespace).toBe('fomvasss')
        expect(PackageURL?.name).toBe('laravel-its-lte')
        expect(PackageURL?.version).toBe('4.22')
    })
})
