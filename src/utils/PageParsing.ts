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
import {parseMVNRepository} from './PageParsing/MVNRepository';
import {parseMavenApache} from './PageParsing/MavenApache';
import {parseSearchMavenOrg} from './PageParsing/SearchMavenOrg';

const getArtifactDetailsFromDOM = (repoFormat: RepoType, url: string): PackageURL | undefined => {
  // console.trace("getArtifactDetailsFromDOM: repoFormat, url", repoFormat, url);
  switch (repoFormat.repoID) {
    case REPOS.npmJs: {
      return parseNPM(url);
      break;
    }
    case REPOS.alpineLinux: {
      return parseAlpine(url);
      break;
    }
    case REPOS.nugetOrg: {
      return parseNuget(url);
      break;
    }
    case REPOS.rubyGemsOrg: {
      return parseRuby(url);
      break;
    }
    case REPOS.pkgGoDev: {
      return parseGolang(url);
      break;
    }
    case REPOS.pypiOrg: {
      return parsePyPIURL(url);
      break;
    }
    case REPOS.cranRProject: {
      return parseCRAN(url);
      break;
    }
    case REPOS.anacondaCom: {
      return parseConda(url);
      break;
    }
    case REPOS.packagistOrg: {
      return parsePackagist(url);
      break;
    }
    case REPOS.mvnRepositoryCom: {
      return parseMVNRepository(url);
      break;
    }
    case REPOS.repoMavenApacheOrg: {
      return parseMavenApache(url);
      break;
    }
    case REPOS.searchMavenOrg: {
      return parseSearchMavenOrg(url);
      break;
    }

    default: {
      throw new Error(`Unhandled Repotype and URL ${repoFormat.repoID} ${url}`);
    }
  }
  console.trace('got here by mistake');
  return undefined;
};

export {getArtifactDetailsFromDOM};
