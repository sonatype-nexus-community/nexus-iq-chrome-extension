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
import React from 'react';
import {DATA_SOURCES, FORMATS, RepoType} from './Constants';
import {getArtifactDetailsFromDOM} from './PageParsing';

describe('Page Parsing', () => {
  test('Parse go page', () => {
    const rt: RepoType = {
      url: '',
      repoFormat: FORMATS.golang,
      titleSelector: '',
      versionPath: '',
      dataSource: DATA_SOURCES.NEXUSIQ,
      appendVersionPath: ''
    };

    const PackageURL = getArtifactDetailsFromDOM(
      rt,
      'https://pkg.go.dev/github.com/etcd-io/etcd@v0.3.0'
    );

    expect(PackageURL).toBeDefined();
  });
});
