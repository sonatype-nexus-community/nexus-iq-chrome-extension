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
import $ from 'cash-dom'
import { PackageURL } from 'packageurl-js'
import { logger, LogLevel } from '../../logger/Logger'
import { generatePackageURL } from './PurlUtils'
import { FORMATS, REPOS, REPO_TYPES } from '../Constants'

export const parseConanIo = (url: string): PackageURL | undefined => {
    const repoType = REPO_TYPES.find((e) => e.repoID == REPOS.conanIo)
    logger.logMessage(`Parsing ConanIo ${repoType?.repoID}`, LogLevel.DEBUG)
    if (repoType) {
        if (repoType.pathRegex) {
            const pathResult = repoType.pathRegex.exec(url.replace(repoType.url, ''))
            if (pathResult && pathResult.groups && repoType.versionDomPath !== undefined) {
                const version = $(repoType.versionDomPath).text().trim().split('/')[1]
                return generatePackageURL(FORMATS.conan, encodeURIComponent(pathResult.groups.artifactId), version)
            }
        }
    } else {
        logger.logMessage('Unable to determine REPO TYPE.', LogLevel.INFO)
    }

    return undefined
}
