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
/*
  https://ossindex.sonatype.org/api/v3/component-report/cran%3AA3%400.0.1
  https://cran.r-project.org/
  https://cran.r-project.org/web/packages/latte/index.html
  https://cran.r-project.org/package=clustcurv
*/
const parseCRAN = (url: string): PackageURL | undefined => {
  const elements = url.split('/');
  let name;
  let version;
  if (elements.length > 5) {
    name = elements[5];
  } else if (elements.length > 3) {
    const pckg = 'package=';
    name = elements[3];
    if (name.search(pckg) >= 0) {
      name = name.substr(pckg.length);
    }
  } else {
    name = $('h2').text();
    if (name.search(':') >= 0) {
      name = name.substring(0, name.search(':'));
    }
  }

  const found = $('table tr:nth-child(1) td:nth-child(2)').first().text();
  if (typeof found !== 'undefined') {
    version = found.trim();
    name = encodeURIComponent(name);
    version = encodeURIComponent(version);

    return generatePackageURL(FORMATS.cran, name, version);
  }

  return undefined;
};

export {parseCRAN};
