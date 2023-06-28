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
//https://mvnrepository.com/artifact/org.apache.struts/struts2-core/2.2.3
//"purl": "pkg:maven/com.mycompany.myproduct/artifact-name@2.1.7",
import { PackageURL } from 'packageurl-js'
import { FORMATS, REPOS, REPO_TYPES } from '../Constants'
import { generatePackageURLComplete } from './PurlUtils'

//pkg:type/namespace/name@version?qualifiers#subpath
//Sonatype expects: "packageUrl": "pkg:maven/org.yaml/snakeyaml@1.17?type=jar"
const parseMVNRepository = (url: string): PackageURL | undefined => {
    const repoType = REPO_TYPES.find((e) => e.repoID == REPOS.mvnRepositoryCom)
    console.debug('*** REPO TYPE: ', repoType)
    if (repoType) {
        if (repoType.pathRegex) {
            const pathResult = repoType.pathRegex.exec(url.replace(repoType.url, ''))
            console.debug(pathResult?.groups)
            if (pathResult && pathResult.groups) {
                return generatePackageURLComplete(
                    FORMATS.maven,
                    encodeURIComponent(pathResult.groups.artifactId),
                    encodeURIComponent(pathResult.groups.version),
                    encodeURIComponent(pathResult.groups.groupId),
                    { type: 'jar' },
                    undefined
                )
            }
        }
    } else {
        console.error('Unable to determine REPO TYPE.')
    }

    return undefined
}

export { parseMVNRepository }
