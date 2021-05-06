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
import {PackageURL} from 'packageurl-js';
import {FORMATS, RepoType} from './Constants';
import {parseAlpine} from './PageParsing/Alpine';
import {parseNPM} from './PageParsing/NPM';
import {parseNuget} from './PageParsing/Nuget';
import {parseRuby} from './PageParsing/RubyGems';
import {parseGolang} from './PageParsing/Golang';
import {parseCRAN} from './PageParsing/CRAN';
import {parseConda} from './PageParsing/Anaconda';

const getArtifactDetailsFromDOM = (repoFormat: RepoType, url: string): PackageURL | undefined => {
  if (repoFormat.repoFormat === FORMATS.npm) {
    return parseNPM(url);
  } else if (repoFormat.repoFormat === FORMATS.alpine) {
    return parseAlpine(url);
  } else if (repoFormat.repoFormat === FORMATS.nuget) {
    return parseNuget(url);
  } else if (repoFormat.repoFormat === FORMATS.gem) {
    return parseRuby(url);
  } else if (repoFormat.repoFormat === FORMATS.golang) {
    return parseGolang(url);
  } else if (repoFormat.repoFormat === FORMATS.cran) {
    return parseCRAN(url);
  } else if (repoFormat.repoFormat === FORMATS.conda) {
    return parseConda(url);
  }

  return undefined;
};

export {getArtifactDetailsFromDOM};
