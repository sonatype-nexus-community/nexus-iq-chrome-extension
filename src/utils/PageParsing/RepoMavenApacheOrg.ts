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
import { logger, LogLevel } from '../../logger/Logger'
import { generatePackageURLComplete } from './PurlUtils'
import { FORMATS, REPOS, REPO_TYPES, RepoType } from '../Constants'

function parseMavenOrg(repoType: RepoType, url: string): PackageURL | undefined {
    if (repoType.pathRegex) {
        const pathResult = repoType.pathRegex.exec(url.replace(repoType.url, ''))
        if (pathResult && pathResult.groups) {
            const gaParts = pathResult.groups.groupArtifactId.trim().split('/')
            const artifactId = gaParts.pop()
            const groupId = gaParts.join('.')
            return generatePackageURLComplete(
                FORMATS.maven,
                encodeURIComponent(artifactId as string),
                encodeURIComponent(pathResult.groups.version),
                encodeURIComponent(groupId),
                { type: 'jar' },
                undefined
            )
        }
    }

    return undefined
}

export const parseRepo1MavenOrg = (url: string): PackageURL | undefined => {
    const repoType = REPO_TYPES.find((e) => e.repoID == REPOS.repo1MavenOrg)
    logger.logMessage(`Parsing ${repoType?.url}`, LogLevel.DEBUG)
    if (repoType) {
        return parseMavenOrg(repoType, url)
    } else {
        logger.logMessage('Unable to determine REPO TYPE.', LogLevel.INFO)
    }

    return undefined
}

export const parseRepoMavenApacheOrg = (url: string): PackageURL | undefined => {
    const repoType = REPO_TYPES.find((e) => e.repoID == REPOS.repoMavenApacheOrg)
    logger.logMessage(`Parsing ${repoType?.url}`, LogLevel.DEBUG)
    if (repoType) {
        return parseMavenOrg(repoType, url)
    } else {
        logger.logMessage('Unable to determine REPO TYPE.', LogLevel.INFO)
    }

    return undefined
}
