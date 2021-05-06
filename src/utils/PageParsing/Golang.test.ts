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
import {readFileSync} from 'fs';
import {join} from 'path';
import {DATA_SOURCES, FORMATS, RepoType} from '../Constants';
import {getArtifactDetailsFromDOM} from '../PageParsing';

describe('Golang Page Parsing', () => {
  const rt: RepoType = {
    url: '',
    repoFormat: FORMATS.golang,
    titleSelector: '',
    versionPath: '',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: ''
  };
  test('Parse golang page etcd version in url', () => {
    const PackageURL = getArtifactDetailsFromDOM(
      rt,
      'https://pkg.go.dev/github.com/etcd-io/etcd@v0.3.0'
    );

    expect(PackageURL).toBeDefined();
    expect(PackageURL?.version).toBe('v0.3.0');
    expect(PackageURL?.namespace).toBe('github.com');
    expect(PackageURL?.name).toBe('etcd-io/etcd');

    expect(PackageURL?.toString()).toBe('pkg:golang/github.com/etcd-io%2Fetcd@v0.3.0');
  });

  test('Parse golang page protobuf version in url', () => {
    const PackageURL = getArtifactDetailsFromDOM(
      rt,
      'https://pkg.go.dev/google.golang.org/protobuf@v1.26.0'
    );
    expect(PackageURL).toBeDefined();
    expect(PackageURL?.version).toBe('v1.26.0');
    expect(PackageURL?.namespace).toBe('google.golang.org');
    expect(PackageURL?.name).toBe('protobuf');
    expect(PackageURL?.toString()).toBe('pkg:golang/google.golang.org/protobuf@v1.26.0');
    //write tests for this and implement it
    // expect(PackageURL?.qualifiers).toBe('runtime');
    // expect(PackageURL?.subpath).toBe('protoimpl');
    //https://pkg.go.dev/google.golang.org/protobuf@v1.26.0/runtime/protoimpl
  });
  test('Parse golang page gopkg.in version in url', () => {
    const PackageURL = getArtifactDetailsFromDOM(rt, 'https://pkg.go.dev/gopkg.in/ini.v1@v1.61.0');
    expect(PackageURL).toBeDefined();
    expect(PackageURL?.version).toBe('v1.61.0');
    expect(PackageURL?.namespace).toBe('gopkg.in');
    expect(PackageURL?.name).toBe('ini.v1');
    expect(PackageURL?.toString()).toBe('pkg:golang/gopkg.in/ini.v1@v1.61.0');
  });

  test('Parse golang page gopkg.in version in url', () => {
    const PackageURL = getArtifactDetailsFromDOM(rt, 'https://pkg.go.dev/gopkg.in/yaml.v2@v2.4.0');
    expect(PackageURL).toBeDefined();
    expect(PackageURL?.version).toBe('v2.4.0');
    expect(PackageURL?.namespace).toBe('gopkg.in');
    expect(PackageURL?.name).toBe('yaml.v2');
    expect(PackageURL?.toString()).toBe('pkg:golang/gopkg.in/yaml.v2@v2.4.0');
  });
  test('should parse a valid Golang page', () => {
    const html = readFileSync(join(__dirname, 'testdata/golang.html'));

    window.document.body.innerHTML = html.toString();
    const PackageURL = getArtifactDetailsFromDOM(rt, 'https://pkg.go.dev/github.com/etcd-io/etcd');

    expect(PackageURL).toBeDefined();
    expect(PackageURL?.namespace).toBe('github.com');
    expect(PackageURL?.name).toBe('etcd-io/etcd');
    expect(PackageURL?.version).toBe('v3.3.25+incompatible');
    expect(PackageURL?.toString()).toBe(
      'pkg:golang/github.com/etcd-io%2Fetcd@v3.3.25%2Bincompatible'
    );
  });
});
