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
import {REPOS, RepoType} from './Constants';
import {parseAlpine} from './PageParsing/Alpine';
import {parseNPM} from './PageParsing/NPM';
import {parseNuget} from './PageParsing/Nuget';
import {parseRuby} from './PageParsing/RubyGems';
import {parseGolang} from './PageParsing/Golang';
import {parsePyPIURL} from './PageParsing/PyPI';
import {parseCRAN} from './PageParsing/CRAN';
import {parseConda} from './PageParsing/Anaconda';
import {parsePackagist} from './PageParsing/Packagist';

const getArtifactDetailsFromDOM = (repoFormat: RepoType, url: string): PackageURL | undefined => {
  if (repoFormat.repoID === REPOS.npmJs) {
    return parseNPM(url);
  } else if (repoFormat.repoID === REPOS.alpineLinux) {
    return parseAlpine(url);
  } else if (repoFormat.repoID === REPOS.nugetOrg) {
    return parseNuget(url);
  } else if (repoFormat.repoID === REPOS.rubyGemsOrg) {
    return parseRuby(url);
  } else if (repoFormat.repoID === REPOS.pkgGoDev) {
    return parseGolang(url);
  } else if (repoFormat.repoID === REPOS.pypiOrg) {
    return parsePyPIURL(url);
  } else if (repoFormat.repoID === REPOS.cranRProject) {
    return parseCRAN(url);
  } else if (repoFormat.repoID === REPOS.anacondaCom) {
    return parseConda(url);
  } else if (repoFormat.repoID === REPOS.packagistOrg) {
    return parsePackagist(url);
  }

  return undefined;
};

export {getArtifactDetailsFromDOM};
