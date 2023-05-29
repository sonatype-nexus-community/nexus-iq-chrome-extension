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
import {describe, expect, test} from '@jest/globals';
import {readFileSync} from 'fs';
import {PackageURL} from 'packageurl-js';
import {join} from 'path';
import {DATA_SOURCES, FORMATS, REPOS, RepoType} from '../Constants';
import {getArtifactDetailsFromDOM} from '../PageParsing';

describe('mavenapache Page Parsing', () => {
  test('should parse a valid mavenapache page', () => {
    const html = readFileSync(join(__dirname, 'testdata/mavenapache.html'));

    window.document.body.innerHTML = html.toString();

    const rt: RepoType = {
      repoID: REPOS.repoMavenApacheOrg,
      url: '',
      repoFormat: FORMATS.maven,
      titleSelector: '',
      versionPath: '',
      dataSource: DATA_SOURCES.NEXUSIQ,
      appendVersionPath: ''
    };

    const packageURL: PackageURL | undefined = getArtifactDetailsFromDOM(
      rt,
      'https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2.1/'
    );
    // console.trace("packageURL", packageURL);
    expect(packageURL).toBeDefined();
    expect(packageURL?.type).toBe('maven');
    expect(packageURL?.namespace).toBe('commons-collections');
    expect(packageURL?.name).toBe('commons-collections');
    expect(packageURL?.version).toBe('3.2.1');
  });

  test('should parse a valid mavenapache page with query string and fragment', () => {
    const html = readFileSync(join(__dirname, 'testdata/mavenapache.html'));

    window.document.body.innerHTML = html.toString();

    const rt: RepoType = {
      repoID: REPOS.repoMavenApacheOrg,
      url: '',
      repoFormat: FORMATS.maven,
      titleSelector: '',
      versionPath: '',
      dataSource: DATA_SOURCES.NEXUSIQ,
      appendVersionPath: ''
    };

    const packageURL: PackageURL | undefined = getArtifactDetailsFromDOM(
      rt,
      'https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2.1/?some=thing#anchor'
    );
    // console.trace("packageURL", packageURL);
    expect(packageURL).toBeDefined();
    expect(packageURL?.type).toBe('maven');
    expect(packageURL?.namespace).toBe('commons-collections');
    expect(packageURL?.name).toBe('commons-collections');
    expect(packageURL?.version).toBe('3.2.1');
  });
});
