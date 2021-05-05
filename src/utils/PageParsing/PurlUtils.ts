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

export {generatePackageURL, generatePackageURLWithNamespace};
