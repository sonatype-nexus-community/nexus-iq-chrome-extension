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
import { FORMATS } from '../Constants'
import { generatePackageURLWithNamespace } from './PurlUtils'

/*
  The following coordinates are missing for given format: [version]
  https://pkg.go.dev/github.com/etcd-io/etcd@v0.3.0 ->CVE-2020-15115, CVE - 2020 - 15136;
  https://pkg.go.dev/github.com/etcd-io/etcd -> v->v3.3.25+incompatible ->unknown
  https://pkg.go.dev/github.com/go-gitea/gitea ->Version: v1.8.3 ->CVE-2018-15192 and others
  https://pkg.go.dev/google.golang.org/protobuf@v1.26.0 ->Version: v1.26.0 ->No vulns, but different namespace
  https://pkg.go.dev/google.golang.org/protobuf@v1.26.0/runtime/protoimpl ->Todo Version: v1.26.0 ->No vulns, but different namespace and some stuff at the end
*/

const PKG_GO_DEV_VERSION_SELECTOR =
    'body > div.Site-content > div > header > div.UnitHeader-content > div > div.UnitHeader-details > span:nth-child(1) > a'
const GO_PKG_IN_V1 = /^gopkg.in\/([^.]+).*/
const GO_PKG_IN_V2 = /^gopkg.in\/([^/]+)\/([^.]+).*/

const parseGolang = (url: string): PackageURL | undefined => {
    return parsePkgGoDevURLIntoPackageURL(url)
}

const parsePkgGoDevURLIntoPackageURL = (url: string): PackageURL | undefined => {
    const uri = new URL(url)
    let nameAndNamespace: NamespaceContainer | undefined
    const nameVersion = uri.pathname.split('@')

    let version = getVersionFromURI(uri)

    if (version !== undefined) {
        nameAndNamespace = getName(handleGoPkgIn(nameVersion[0].replace(/^\//, '')))
    } else {
        const found = $(PKG_GO_DEV_VERSION_SELECTOR)

        if (typeof found !== 'undefined') {
            nameAndNamespace = getName(handleGoPkgIn(uri.pathname.replace(/^\//, '')))

            version = found.text().trim().replace('Version: ', '').trim()
        }
    }

    if (nameAndNamespace && version != null) {
        return generatePackageURLWithNamespace(
            FORMATS.golang,
            nameAndNamespace.name,
            version,
            nameAndNamespace.namespace
        )
    }

    return undefined
}

const getVersionFromURI = (uri: URL): string | undefined => {
    const nameVersion = uri.pathname.split('@')

    if (nameVersion.length > 1) {
        //check that the version doesnt have slashes to handle @v1.26.0/runtime/protoimpl
        return nameVersion[1].split('/')[0]
    }

    return undefined
}

const getName = (name: string): NamespaceContainer | undefined => {
    const nameAndNamespace = name.split('/')

    if (nameAndNamespace.length > 0) {
        if (nameAndNamespace.length > 2) {
            const namespace = nameAndNamespace.slice(0, nameAndNamespace.length - 1).join('/')

            return { name: nameAndNamespace[nameAndNamespace.length - 1], namespace: namespace }
        }
        return { name: nameAndNamespace[1], namespace: nameAndNamespace[0] }
    }

    return undefined
}

const handleGoPkgIn = (namespace: string): string => {
    const foundV2 = namespace.match(GO_PKG_IN_V2)
    if (foundV2) {
        return namespace.replace(GO_PKG_IN_V2, `github.com/$1/$2`)
    }

    const foundV1 = namespace.match(GO_PKG_IN_V1)
    if (foundV1) {
        return namespace.replace(GO_PKG_IN_V1, `github.com/go-$1/$1`)
    }

    return namespace
}

interface NamespaceContainer {
    name: string
    namespace: string
}

export { parseGolang }
