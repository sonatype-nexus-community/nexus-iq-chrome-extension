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
import { PackageURL } from 'packageurl-js';

const getArtifactDetailsFromDOM = (format: string, url: string): PackageURL | undefined => {
  console.info("url", url);
  console.info("format", format);
  
  if (format === "npm") {
    return parseNPM(url);
  }
  return undefined;
}

const parseNPM = (url: string): PackageURL | undefined => {
  if (url && url.search("/v/") > 0) {
    console.info("Parsing URL", url);
    
    var urlElements = url.split("/");
    const name: string = urlElements[4];
    const version: string = urlElements[6];

    return npmNameOrNamespace(name, version);
  } else {
    const found = $("h2 span");

    if (typeof found !== "undefined") {
      console.log("h2 span found", found);

      const name = found
        .text()
        .trim();

      let newV = $("h2")
        .next("span");

      if (typeof newV !== "undefined") {
        let newVText = newV.text();

        const findnbsp = newVText.search(String.fromCharCode(160));

        if (findnbsp >= 0) {
          return npmNameOrNamespace(name, newVText.substring(0, findnbsp));
        }

        return npmNameOrNamespace(name, newVText);
      }
    }
  }

  return undefined;
}

const npmNameOrNamespace = (name: string, version: string): PackageURL => {
  if (name.includes("/")) {
    const namespaceAndName = name.split("/");

    return generatePackageURLWithNamespace("npm", namespaceAndName[1], version, namespaceAndName[0]);
  }

  return generatePackageURL("npm", name, version)
}

const generatePackageURL = (format: string, name: string, version: string): PackageURL => {
  return generatePackageURLWithNamespace(format, name, version, undefined);
}

const generatePackageURLWithNamespace = (format: string, name: string, version: string, namespace: string | undefined): PackageURL => {
  return new PackageURL(format, namespace, name, version, undefined, undefined);
}

export { getArtifactDetailsFromDOM };