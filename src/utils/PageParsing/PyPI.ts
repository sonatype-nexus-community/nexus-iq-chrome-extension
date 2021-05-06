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
import { FORMATS } from '../Constants';
import {generatePackageURL} from './PurlUtils';

// https://pypi.org/project/Django/
const parsePyPIURL = (url: string): PackageURL | undefined => {
    const elements = url.split("/");

    const name = elements[4];
    if (elements.length > 6) {
        return generatePackageURL(FORMATS.pypi, name, elements[5]);
    }
    const version = $('#content > div.banner > div > div.package-header__left > h1 ').text().trim();
    if (typeof version !== 'undefined') {
        const versionArray = version.split(' ');   
        if (versionArray.length > 0) {
            return generatePackageURL(FORMATS.pypi, name, versionArray[1]);
        }
    }
    return undefined;
  };

  export {parsePyPIURL};