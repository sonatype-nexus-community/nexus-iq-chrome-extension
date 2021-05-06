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
import $ from 'cash-dom';
import {PackageURL} from 'packageurl-js';
import {generatePackageURLWithNamespace} from './PurlUtils';

/*
  The following coordinates are missing for given format: [version]
  https://pkg.go.dev/github.com/etcd-io/etcd@v0.3.0 ->CVE-2020-15115, CVE - 2020 - 15136;
  https://pkg.go.dev/github.com/etcd-io/etcd -> v->v3.3.25+incompatible ->unknown
  https://pkg.go.dev/github.com/go-gitea/gitea ->Version: v1.8.3 ->CVE-2018-15192 and others
  https://pkg.go.dev/google.golang.org/protobuf@v1.26.0 ->Version: v1.26.0 ->No vulns, but different namespace
  https://pkg.go.dev/google.golang.org/protobuf@v1.26.0/runtime/protoimpl ->Todo Version: v1.26.0 ->No vulns, but different namespace and some stuff at the end
*/
const parseGolang = (url: string): PackageURL | undefined => {
  return parseUrlIntoGolangThing(url);
};

const parseUrlIntoGolangThing = (url: string): PackageURL | undefined => {
  const uri = new URL(url);

  const nameVersion = uri.pathname.split('@');

  if (nameVersion.length > 1) {
    const nameAndNamespace = getName(nameVersion[0]);
    if (nameAndNamespace) {
      return generatePackageURLWithNamespace(
        'golang',
        nameAndNamespace.namespace,
        nameAndNamespace.name,
        nameVersion[1]
      );
    }
  } else {
    const found = $(
      'body > div.Site-content > div > header > div.UnitHeader-content > div > div.UnitHeader-details > span:nth-child(1) > a'
    );

    if (typeof found !== 'undefined') {
      const name = getName(uri.pathname);
      const version = found.text().trim().replace('Version: ', '').trim();
      if (name) {
        return generatePackageURLWithNamespace('golang', name.namespace, name.name, version);
      }
    }
  }

  return undefined;
};

const getName = (name: string): NamespaceContainer | undefined => {
  while (name.charAt(0) === '/') {
    name = name.substring(1);
  }

  const nameAndNamespace = name.split('/');

  if (nameAndNamespace.length > 0) {
    if (nameAndNamespace.length > 2) {
      const namespace = nameAndNamespace.slice(0, nameAndNamespace.length - 1).join('/');

      return {name: nameAndNamespace[nameAndNamespace.length - 1], namespace: namespace};
    }
    return {name: nameAndNamespace[1], namespace: nameAndNamespace[0]};
  }

  return undefined;
};

interface NamespaceContainer {
  name: string;
  namespace: string;
}

export {parseGolang};
