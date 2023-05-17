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
import {join} from 'path';
import {DATA_SOURCES, FORMATS, REPOS, RepoType} from '../Constants';
import {getArtifactDetailsFromDOM} from '../PageParsing';

describe('Anaconda Page Parsing', () => {
  test('should parse a valid Anaconda page', () => {
    const html = readFileSync(join(__dirname, 'testdata/anaconda.html'));

    window.document.body.innerHTML = html.toString();

    const rt: RepoType = {
      url: '',
      repoFormat: FORMATS.conda,
      repoID: REPOS.anacondaCom,
      titleSelector: '',
      versionPath: '',
      dataSource: DATA_SOURCES.OSSINDEX,
      appendVersionPath: ''
    };

    const PackageURL = getArtifactDetailsFromDOM(rt, 'https://anaconda.org/conda-forge/numpy');

    expect(PackageURL).toBeDefined();
    expect(PackageURL?.type).toBe(FORMATS.conda);
    expect(PackageURL?.name).toBe('numpy');
    expect(PackageURL?.version).toBe('1.20.2');
  });

  test('should parse a valid Anaconda page with query string', () => {
    const html = readFileSync(join(__dirname, 'testdata/anaconda.html'));

    window.document.body.innerHTML = html.toString();

    const rt: RepoType = {
      url: '',
      repoFormat: FORMATS.conda,
      repoID: REPOS.anacondaCom,
      titleSelector: '',
      versionPath: '',
      dataSource: DATA_SOURCES.OSSINDEX,
      appendVersionPath: ''
    };

    const PackageURL = getArtifactDetailsFromDOM(rt, 'https://anaconda.org/conda-forge/numpy?something=else');

    expect(PackageURL).toBeDefined();
    expect(PackageURL?.type).toBe(FORMATS.conda);
    expect(PackageURL?.name).toBe('numpy');
    expect(PackageURL?.version).toBe('1.20.2');
  });
});
