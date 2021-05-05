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
import {RepoType} from './Constants';

const getArtifactDetailsFromDOM = (repoFormat: RepoType, url: string): PackageURL | undefined => {
  console.info('url', url);
  console.info('format', repoFormat.repoFormat);

  if (repoFormat.repoFormat === 'npm') {
    return parseNPM(url);
  } else if (repoFormat.repoFormat === 'alpine') {
    return parseAlpine(url);
  } else if (repoFormat.repoFormat === 'nuget') {
    return parseNuget(url);
  }
  return undefined;
};

const parseAlpine = (url: string): PackageURL | undefined => {
  console.log('parseAlpine, url:', url);

  const elements = url.split('/');
  console.log(elements.length);
  // let version;
  let name = elements[7];
  name = name.replace('#', '');

  const version = $('#package > tbody > tr:nth-child(2) > td > strong > a').text().trim();

  console.log('version', version);
  // let artifact = {
  //   // datasource: dataSources.NEXUSIQ,
  //   name: name,
  //   version: version,
  // };
  // return artifact;
  return generatePackageURL('alpine', name, version);
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
