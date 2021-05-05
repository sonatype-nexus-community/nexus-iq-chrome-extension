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
import {FORMATS, RepoType} from './Constants';

const getArtifactDetailsFromDOM = (repoFormat: RepoType, url: string): PackageURL | undefined => {
  console.info('getArtifactDetailsFromDOM url', url, repoFormat.repoFormat);

  if (repoFormat.repoFormat === FORMATS.npm) {
    return parseNPM(url);
  } else if (repoFormat.repoFormat === FORMATS.nuget) {
    return parseNuget(url);
  } else if (repoFormat.repoFormat === FORMATS.golang) {
    // console.log('parsegolang', url);
    const purl: PackageURL | undefined = parseGolang(url);

    // console.log('purl', purl);
    return purl;
  }

  return undefined;
};

const parseGolang = (url: string): PackageURL | undefined => {
  console.log('parseGolang', url);
  // const name = 'etcd-io/etcd';
  // const version = 'v3.3.25+incompatible';
  // pkg:GOLANG/google.golang.org/genproto#/googleapis/api/annotations/;
  // return generatePackageURL(FORMATS.golang, packageId, version);
  // The following coordinates are missing for given format: [version]
  //https://pkg.go.dev/github.com/etcd-io/etcd@v0.3.0 ->CVE-2020-15115, CVE - 2020 - 15136;
  //https://pkg.go.dev/github.com/etcd-io/etcd -> v->v3.3.25+incompatible ->unknown
  //https://pkg.go.dev/github.com/go-gitea/gitea ->Version: v1.8.3 ->CVE-2018-15192 and others

  const elements = url.split('/');
  const type = 'golang';
  const namespace = 'github.com';
  let name;
  // const version = 'v3.3.25+incompatible';
  const qualifiers = null;
  const subpath = null;
  let version = undefined;
  if (elements.length == 6) {
    const name1 = elements[4];
    let name2 = elements[5];
    const whereVersion = name2.search('@v'); //version in the URL
    if (whereVersion > -1) {
      version = name2.substring(whereVersion + 1);
      name2 = name2.substring(0, whereVersion);
    } else {
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
    name = name1 + '/' + name2;
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
  }
  return undefined;
};

const parseNPM = (url: string): PackageURL | undefined => {
  if (url && url.search('/v/') > 0) {
    console.info('Parsing URL', url);

    const urlElements = url.split('/');
    const name: string = urlElements[4];
    const version: string = urlElements[6];

    return npmNameOrNamespace(name, version);
  } else {
    const found = $('h2 span');

    if (typeof found !== 'undefined') {
      console.log('h2 span found', found);

      const name = found.text().trim();

      const newV = $('h2').next('span');

      if (typeof newV !== 'undefined') {
        const newVText = newV.text();

        const findnbsp = newVText.search(String.fromCharCode(160));

        if (findnbsp >= 0) {
          return npmNameOrNamespace(name, newVText.substring(0, findnbsp));
        }

        return npmNameOrNamespace(name, newVText);
      }
    }
  }

  return undefined;
};

const parseNuget = (url: string): PackageURL | undefined => {
  const elements = url.split('/');
  if (elements.length == 6) {
    const packageId = encodeURIComponent(elements[4]);
    const version = encodeURIComponent(elements[5]);

    return generatePackageURL('nuget', packageId, version);
  }

  return undefined;
};

const npmNameOrNamespace = (name: string, version: string): PackageURL => {
  if (name.includes('/')) {
    const namespaceAndName = name.split('/');

    return generatePackageURLWithNamespace(
      'npm',
      namespaceAndName[1],
      version,
      namespaceAndName[0]
    );
  }

  return generatePackageURL('npm', name, version);
};

const generatePackageURL = (format: string, name: string, version: string): PackageURL => {
  return generatePackageURLWithNamespace(format, name, version, undefined);
};

const generatePackageURLWithNamespace = (
  format: string,
  name: string,
  version: string,
  namespace: string | undefined
): PackageURL => {
  return new PackageURL(format, namespace, name, version, undefined, undefined);
};

export {getArtifactDetailsFromDOM};
