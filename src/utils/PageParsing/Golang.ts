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
import {FORMATS} from '../Constants';
import {generatePackageURL} from './PurlUtils';

const parseGolang = (url: string): PackageURL | undefined => {
  // console.log('parseGolang', url);
  // const name = 'etcd-io/etcd';
  // const version = 'v3.3.25+incompatible';
  // pkg:GOLANG/google.golang.org/genproto#/googleapis/api/annotations/;
  // return generatePackageURL(FORMATS.golang, packageId, version);
  // The following coordinates are missing for given format: [version]
  //https://pkg.go.dev/github.com/etcd-io/etcd@v0.3.0 ->CVE-2020-15115, CVE - 2020 - 15136;
  //https://pkg.go.dev/github.com/etcd-io/etcd -> v->v3.3.25+incompatible ->unknown
  //https://pkg.go.dev/github.com/go-gitea/gitea ->Version: v1.8.3 ->CVE-2018-15192 and others
  //https://pkg.go.dev/google.golang.org/protobuf@v1.26.0 ->Version: v1.26.0 ->No vulns, but different namespace
  //https://pkg.go.dev/google.golang.org/protobuf@v1.26.0/runtime/protoimpl ->Todo Version: v1.26.0 ->No vulns, but different namespace and some stuff at the end
  const elements = url.split('/');
  const type = FORMATS.golang;
  const namespace = elements[3];
  let name = '';
  const qualifiers = null;
  const subpath = null;
  let version = undefined;
  const lastElementIndex = elements.length - 1;
  const name1 = '';
  const lastElement = elements[lastElementIndex];
  const whereVersion = lastElement.search('@v');
  let lastElementWithoutVersion = '';
  if (whereVersion > -1) {
    //version in the url
    version = lastElement.substring(whereVersion + 1);
    lastElementWithoutVersion = lastElement.substring(0, whereVersion);
  } else {
    lastElementWithoutVersion = lastElement;
    //parse the body for the version
    const found = $(
      'body > div.Site-content > div > header > div.UnitHeader-content > div > div.UnitHeader-details > span:nth-child(1) > a'
    );
    if (typeof found !== 'undefined') {
      console.log('found', found);
      version = found.text().trim();
      version = version.replace('Version: ', '').trim();
    } else {
      return undefined;
    }
  }
  if (elements.length == 5) {
    name = lastElementWithoutVersion;
  } else if (elements.length == 6) {
    name = elements[4] + '/' + lastElementWithoutVersion;
  }
  const purl: PackageURL | undefined = new PackageURL(
    FORMATS.golang,
    namespace,
    name,
    version,
    qualifiers,
    subpath
  );
  // console.log('purl', purl);
  return purl;
};

export {parseGolang};
