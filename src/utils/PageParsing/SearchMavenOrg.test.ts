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
import { PackageURL } from 'packageurl-js'
import { join } from 'path'
import { FORMATS, REPOS, REPO_TYPES } from '../Constants'
import { ensure } from '../Helpers'
import { getArtifactDetailsFromDOM } from '../PageParsing'

describe('SearchMavenOrg Page Parsing', () => {
    const repoType = REPO_TYPES.find((e) => e.repoID == REPOS.searchMavenOrg)
    expect(repoType).toBeDefined()

    test('should parse a valid SearchMavenOrg page (JAR)', () => {
        const html = readFileSync(join(__dirname, 'testdata/SearchMavenOrg.html'))

        window.document.body.innerHTML = html.toString()
        //https://search.maven.org/artifact/org.apache.struts/struts2-core/2.3.30/jar

        const packageURL: PackageURL | undefined = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://search.maven.org/artifact/org.apache.struts/struts2-core/2.3.30/jar'
        )

        expect(packageURL).toBeDefined()
        expect(packageURL?.type).toBe(FORMATS.maven)
        expect(packageURL?.namespace).toBe('org.apache.struts')
        expect(packageURL?.name).toBe('struts2-core')
        expect(packageURL?.version).toBe('2.3.30')
        expect(packageURL?.qualifiers).toEqual({ type: 'jar' })
    })

    test('should parse a valid SearchMavenOrg page (Maven Plugin)', () => {
        const html = readFileSync(join(__dirname, 'testdata/SearchMavenOrg.html'))

        window.document.body.innerHTML = html.toString()
        //https://search.maven.org/artifact/org.apache.struts/struts2-core/2.3.30/jar

        const packageURL: PackageURL | undefined = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://search.maven.org/artifact/org.cyclonedx/cyclonedx-maven-plugin/2.7.6/maven-plugin'
        )

        expect(packageURL).toBeDefined()
        expect(packageURL?.type).toBe(FORMATS.maven)
        expect(packageURL?.namespace).toBe('org.cyclonedx')
        expect(packageURL?.name).toBe('cyclonedx-maven-plugin')
        expect(packageURL?.version).toBe('2.7.6')
        expect(packageURL?.qualifiers).toEqual({ type: 'maven-plugin' })
    })

    test('should parse a valid SearchMavenOrg page (Maven Plugin) + QS + F', () => {
        const html = readFileSync(join(__dirname, 'testdata/SearchMavenOrg.html'))

        window.document.body.innerHTML = html.toString()
        //https://search.maven.org/artifact/org.apache.struts/struts2-core/2.3.30/jar

        const packageURL: PackageURL | undefined = getArtifactDetailsFromDOM(
            ensure(repoType),
            'https://search.maven.org/artifact/org.cyclonedx/cyclonedx-maven-plugin/2.7.6/maven-plugin?some=thing#heading'
        )

        expect(packageURL).toBeDefined()
        expect(packageURL?.type).toBe(FORMATS.maven)
        expect(packageURL?.namespace).toBe('org.cyclonedx')
        expect(packageURL?.name).toBe('cyclonedx-maven-plugin')
        expect(packageURL?.version).toBe('2.7.6')
        expect(packageURL?.qualifiers).toEqual({ type: 'maven-plugin' })
    })
})
