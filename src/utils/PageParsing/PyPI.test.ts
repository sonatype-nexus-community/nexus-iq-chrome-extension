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
import {DATA_SOURCES, FORMATS, RepoType, REPOS} from '../Constants';
import {getArtifactDetailsFromDOM} from '../PageParsing';

describe('PyPI Page Parsing', () => {
  test('should parse a valid PyPI page', () => {
    const html = readFileSync(join(__dirname, 'testdata/pypi.html'));

    window.document.body.innerHTML = html.toString();

    const rt: RepoType = {
      repoID: REPOS.pypi,
      url: '',
      repoFormat: FORMATS.pypi,
      titleSelector: '',
      versionPath: '',
      dataSource: DATA_SOURCES.OSSINDEX,
      appendVersionPath: ''
    };

    const PackageURL = getArtifactDetailsFromDOM(rt, 'https://pypi.org/project/Django/');

    expect(PackageURL).toBeDefined();
    expect(PackageURL?.type).toBe(FORMATS.pypi);
    expect(PackageURL?.name).toBe('Django');
    expect(PackageURL?.version).toBe('3.2.2');
  });

  test('should parse valid PyPI page with the version', () => {
    const rt: RepoType = {
      repoID: REPOS.pypi,
      url: '',
      repoFormat: FORMATS.pypi,
      titleSelector: '',
      versionPath: '',
      dataSource: DATA_SOURCES.OSSINDEX,
      appendVersionPath: ''
    };
    const PackageURL = getArtifactDetailsFromDOM(rt, 'https://pypi.org/project/jake/0.2.70/');

    expect(PackageURL).toBeDefined();
    expect(PackageURL?.type).toBe(FORMATS.pypi);
    expect(PackageURL?.name).toBe('jake');
    expect(PackageURL?.version).toBe('0.2.70');
  });
});
