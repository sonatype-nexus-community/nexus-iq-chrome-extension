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

const parsePackagist = (url: string): PackageURL | undefined => {
  const elements = url.split('/');
  const namespace = elements[4];
  const name = elements[5];
  const versionInURLPosition = elements[5].search('#');
  //is the version number in the URL? if so get that, else get it from the HTML
  if (versionInURLPosition > -1) {
    return generatePackageURLWithNamespace(
      'composer',
      name.substr(0, versionInURLPosition),
      name.substr(versionInURLPosition + 1),
      namespace
    );
  } else {
    const versionHTML = $('span.version-number').first().text();
    if (typeof versionHTML !== 'undefined') {
      return generatePackageURLWithNamespace('composer', name, versionHTML.trim(), namespace);
    }
  }
  return undefined;
};

export {parsePackagist};
