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

describe('NPM Page Parsing', () => {
  test('should parse a valid NPM page', () => {
    const html = readFileSync(join(__dirname, 'testdata/npm.html'));

    window.document.body.innerHTML = html.toString();

    const rt: RepoType = {
      url: '',
      repoFormat: FORMATS.npm,
      titleSelector: '',
      versionPath: '',
      dataSource: DATA_SOURCES.NEXUSIQ,
      appendVersionPath: ''
    };

    const PackageURL = getArtifactDetailsFromDOM(
      rt,
      'https://www.npmjs.com/package/@sonatype/react-shared-components'
    );

    expect(PackageURL).toBeDefined();
    expect(PackageURL?.type).toBe('npm');
    expect(PackageURL?.namespace).toBe('@sonatype');
    expect(PackageURL?.name).toBe('react-shared-components');
    expect(PackageURL?.version).toBe('6.0.1');
  });
});
