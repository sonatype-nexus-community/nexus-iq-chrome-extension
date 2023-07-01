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
import { PackageURL } from 'packageurl-js'
import { logger, LogLevel } from '../logger/Logger'
import { REPOS, RepoType } from './Constants'
import { parseAlpine } from './PageParsing/Alpine'
import { parseNPM } from './PageParsing/NPM'
import { parseNuget } from './PageParsing/Nuget'
import { parseRuby } from './PageParsing/RubyGems'
import { parseGolang } from './PageParsing/Golang'
import { parsePyPIURL } from './PageParsing/PyPI'
import { parseCRAN } from './PageParsing/CRAN'
import { parsePackagist } from './PageParsing/Packagist'
import { parseMVNRepository } from './PageParsing/MVNRepository'
import { parseSearchMavenOrg } from './PageParsing/SearchMavenOrg'
import { parseCentralSonatypeCom } from './PageParsing/CentralSonatypeCom'
import { parseCocoaPods } from './PageParsing/CocoaPods'
import { parseConanIo } from './PageParsing/ConanIo'
import { parseRepo1MavenOrg, parseRepoMavenApacheOrg } from './PageParsing/RepoMavenApacheOrg'

export const getArtifactDetailsFromDOM = (repoFormat: RepoType, url: string): PackageURL | undefined => {
    logger.logMessage('In getArtifactDetailsFromDOM', LogLevel.TRACE, repoFormat, url)

    switch (repoFormat.repoID) {
        case REPOS.cocoaPodsOrg:
            return parseCocoaPods(url)
        case REPOS.conanIo:
            return parseConanIo(url)

        case REPOS.repo1MavenOrg:
            return parseRepo1MavenOrg(url)

        case REPOS.repoMavenApacheOrg:
            return parseRepoMavenApacheOrg(url)

        case REPOS.npmJs: {
            return parseNPM(url)
        }
        case REPOS.alpineLinux: {
            return parseAlpine(url)
        }
        case REPOS.nugetOrg: {
            return parseNuget(url)
        }
        case REPOS.rubyGemsOrg: {
            return parseRuby(url)
        }
        case REPOS.pkgGoDev: {
            return parseGolang(url)
        }
        case REPOS.pypiOrg: {
            return parsePyPIURL(url)
        }
        case REPOS.cranRProject: {
            return parseCRAN(url)
        }
        case REPOS.packagistOrg: {
            return parsePackagist(url)
        }
        case REPOS.mvnRepositoryCom: {
            return parseMVNRepository(url)
        }
        case REPOS.searchMavenOrg: {
            return parseSearchMavenOrg(url)
        }
        case REPOS.centralSonatypeCom: {
            return parseCentralSonatypeCom(url)
        }

        default: {
            logger.logMessage(`Unhandled Repotype and URL ${repoFormat.repoID} ${url}`, LogLevel.WARN)
        }
    }

    return undefined
}
