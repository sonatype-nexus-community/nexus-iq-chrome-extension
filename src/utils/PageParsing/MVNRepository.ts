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
//https://mvnrepository.com/artifact/org.apache.struts/struts2-core/2.2.3
//"purl": "pkg:maven/com.mycompany.myproduct/artifact-name@2.1.7",
import {PackageURL} from 'packageurl-js';
import {FORMATS} from '../Constants';
import {generatePackageURLComplete} from './PurlUtils';

//pkg:type/namespace/name@version?qualifiers#subpath
//Sonatype expects: "packageUrl": "pkg:maven/org.yaml/snakeyaml@1.17?type=jar"
const parseMVNRepository = (url: string): PackageURL | undefined => {
  const elements = url.split('/');
  if (elements.length == 7) {
    const group = encodeURIComponent(elements[4]);
    const artifact = encodeURIComponent(elements[5]);
    const version = encodeURIComponent(elements[6]);
    const qualifiers = {type: 'jar'}; //main.js:79307 Error: Error: The following coordinates are missing for given format: [type]
    const subpath = undefined;
    const format: string = FORMATS.maven;
    return generatePackageURLComplete(format, artifact, version, group, qualifiers, subpath);
  }

  return undefined;
};

export {parseMVNRepository};
