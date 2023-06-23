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
import { DATA_SOURCES, FORMATS, REPOS, RepoType } from '../Constants'
import { getArtifactDetailsFromDOM } from '../PageParsing'

describe('Golang Page Parsing', () => {
    const rt: RepoType = {
        url: '',
        repoFormat: FORMATS.golang,
        repoID: REPOS.pkgGoDev,
        titleSelector: '',
        versionPath: '',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '',
    }
    test('Parse golang page etcd version in url', () => {
        const packageURL: PackageURL | undefined = getArtifactDetailsFromDOM(
            rt,
            'https://pkg.go.dev/github.com/etcd-io/etcd@v0.3.0'
        )

        expect(packageURL).toBeDefined()
        expect(packageURL?.version).toBe('v0.3.0')
        expect(packageURL?.namespace).toBe('github.com/etcd-io')
        expect(packageURL?.name).toBe('etcd')
    })

    test('Parse golang page protobuf version in url', () => {
        const PackageURL = getArtifactDetailsFromDOM(rt, 'https://pkg.go.dev/google.golang.org/protobuf@v1.26.0')
        expect(PackageURL).toBeDefined()
        expect(PackageURL?.version).toBe('v1.26.0')
        expect(PackageURL?.namespace).toBe('google.golang.org')
        expect(PackageURL?.name).toBe('protobuf')
        expect(PackageURL?.toString()).toBe('pkg:golang/google.golang.org/protobuf@v1.26.0')
        //write tests for this and implement it
        // expect(PackageURL?.qualifiers).toBe('runtime');
        // expect(PackageURL?.subpath).toBe('protoimpl');
        //https://pkg.go.dev/google.golang.org/protobuf@v1.26.0/runtime/protoimpl
    })

    test('Parse golang page protobuf version in url and subpath', () => {
        const PackageURL = getArtifactDetailsFromDOM(
            rt,
            'https://pkg.go.dev/google.golang.org/protobuf@v1.26.0/runtime/protoimpl'
        )
        expect(PackageURL).toBeDefined()
        expect(PackageURL?.version).toBe('v1.26.0')
        expect(PackageURL?.namespace).toBe('google.golang.org')
        expect(PackageURL?.name).toBe('protobuf')
        expect(PackageURL?.toString()).toBe('pkg:golang/google.golang.org/protobuf@v1.26.0')
    })
    test('Parse golang page gopkg.in version in url', () => {
        const PackageURL = getArtifactDetailsFromDOM(rt, 'https://pkg.go.dev/gopkg.in/ini.v1@v1.61.0')
        expect(PackageURL).toBeDefined()
        expect(PackageURL?.version).toBe('v1.61.0')
        expect(PackageURL?.namespace).toBe('github.com/go-ini')
        expect(PackageURL?.name).toBe('ini')
    })

    test('Parse golang page gopkg.in version in url', () => {
        const PackageURL = getArtifactDetailsFromDOM(rt, 'https://pkg.go.dev/gopkg.in/yaml.v2@v2.4.0')
        expect(PackageURL).toBeDefined()
        expect(PackageURL?.version).toBe('v2.4.0')
        expect(PackageURL?.namespace).toBe('github.com/go-yaml')
        expect(PackageURL?.name).toBe('yaml')
    })
    test('should parse a valid Golang page etcd', () => {
        const html = readFileSync(join(__dirname, 'testdata/golang.html'))

        window.document.body.innerHTML = html.toString()
        const PackageURL = getArtifactDetailsFromDOM(rt, 'https://pkg.go.dev/github.com/etcd-io/etcd')

        expect(PackageURL).toBeDefined()
        expect(PackageURL?.namespace).toBe('github.com/etcd-io')
        expect(PackageURL?.name).toBe('etcd')
        expect(PackageURL?.version).toBe('v3.3.25+incompatible')
    })
})
