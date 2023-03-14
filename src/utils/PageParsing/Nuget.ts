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

import {PackageURL} from 'packageurl-js';
import {generatePackageURL} from './PurlUtils';

const parseNuget = (url: string): PackageURL | undefined => {
  const urlLeftOfHash = url.split('#');
  const elements = urlLeftOfHash[0].split('/');
  if (elements.length == 6) {
    const packageId = encodeURIComponent(elements[4]);
    const version = encodeURIComponent(elements[5]);
    if (version) {
      return generatePackageURL('nuget', packageId, version);
    }
  }

  return undefined;
};

export {parseNuget};
