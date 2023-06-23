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

describe('Alpine Page Parsing', () => {
    const repoType = REPO_TYPES.find((e) => e.repoID == REPOS.alpineLinux)
    expect(repoType).toBeDefined()

    test('should parse a valid Alpine page', () => {
        const html = readFileSync(join(__dirname, 'testdata/alpine.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://pkgs.alpinelinux.org/package/edge/main/x86/openssl'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe(FORMATS.alpine)
        expect(PackageURL?.name).toBe('openssl')
        expect(PackageURL?.version).toBe('1.1.1k-r0')
    })

    test('Should parse a valid Alpine page with query string', () => {
        const html = readFileSync(join(__dirname, 'testdata/alpine.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://pkgs.alpinelinux.org/package/edge/main/x86/openssl?something=else'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe(FORMATS.alpine)
        expect(PackageURL?.name).toBe('openssl')
        expect(PackageURL?.version).toBe('1.1.1k-r0')
    })

    test('Should parse v3.15/main/x86/busybox', () => {
        const html = readFileSync(join(__dirname, 'testdata/alpine-old.html'))

        window.document.body.innerHTML = html.toString()

        const PackageURL = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://pkgs.alpinelinux.org/package/v3.15/main/x86/busybox?something=else'
        )

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.type).toBe(FORMATS.alpine)
        expect(PackageURL?.name).toBe('busybox')
        expect(PackageURL?.version).toBe('1.34.1-r7')
    })
})
