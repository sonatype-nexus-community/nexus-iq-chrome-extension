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
import { FORMATS, REPOS, REPO_TYPES } from '../Constants'
import { generatePackageURLWithNamespace } from './PurlUtils'

const parsePackagist = (url: string): PackageURL | undefined => {
    const repoType = REPO_TYPES.find((e) => e.repoID == REPOS.packagistOrg)
    console.debug('*** REPO TYPE: ', repoType)
    if (repoType) {
        if (repoType.pathRegex) {
            const pathResult = repoType.pathRegex.exec(url.replace(repoType.url, ''))
            console.debug(pathResult?.groups)
            if (pathResult && pathResult.groups) {
                console.debug($(repoType.versionDomPath))
                const pageVersion = $(repoType.versionDomPath).text().trim()
                console.debug(`URL Version: ${pathResult.groups.version}, Page Version: ${pageVersion}`)
                return generatePackageURLWithNamespace(
                    FORMATS.composer,
                    encodeURIComponent(pathResult.groups.artifactId),
                    pathResult.groups.version !== undefined ? pathResult.groups.version : pageVersion,
                    encodeURIComponent(pathResult.groups.groupId)
                )
            }
        }
    } else {
        console.error('Unable to determine REPO TYPE.')
    }

    return undefined
}

export { parsePackagist }
