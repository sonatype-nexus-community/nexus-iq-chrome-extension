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

// https://clojars.org/k2n/saml20-clj/versions/0.1.7
const parseClojars = (url: string): PackageURL | undefined => {
  //   console.log("parseClojars -  format, url:", format, url);

  const elements = url.split('/');
  //   console.log('ELEMENTS', elements);
  //   const name = elements[3] + '/' + elements[4];
  const name = elements[4];
  //[k2n/saml20-clj "0.1.9"] - Clojars
  const title = document.title;
  console.log('title', title);
  const version = title.split(' ')[1].replace(/"/g, '').replace(']', '').trim();
  //   console.log('NAME', name, 'VERSION', version)
  return generatePackageURL(FORMATS.clojars, name, version);
};

export {parseClojars};
