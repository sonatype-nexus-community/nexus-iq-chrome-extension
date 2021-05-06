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

import {ServiceHelpers} from './ServiceHelpers';
import {OSSIndexResponse} from '../types/OSSIndexResponse';
import {ComponentContainer, SecurityIssue} from '../types/ArtifactMessage';
import {DEFAULT_OSSINDEX_URL} from '../utils/Constants';
import {PackageURL} from 'packageurl-js';

export class OSSIndexRequestService {
  private readonly xsrfCookieName = 'CLM-CSRF-TOKEN';
  private readonly xsrfHeaderName = 'X-CSRF-TOKEN';

  constructor(
    readonly url: string = DEFAULT_OSSINDEX_URL,
    readonly user: string = '',
    readonly token: string = ''
  ) {}

  public async getComponentDetails(purl: PackageURL): Promise<ComponentContainer> {
    const headers = await this.getHeaders();
    headers.set('Content-Type', 'application/json');

    const data = {
      coordinates: [this.sanitizePurl(purl)]
    };

    return new Promise((resolve, reject) => {
      fetch(`${this.url}api/v3/component-report`, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(data)
      })
        .then(async (res) => {
          if (res.ok) {
            const body = (await res.json()) as Array<OSSIndexResponse>;

            if (body.length > 0) {
              const securityIssues: SecurityIssue[] = new Array<SecurityIssue>();
              if (body[0].vulnerabilities.length > 0) {
                body[0].vulnerabilities.forEach((vuln) => {
                  const source: string = vuln.cve ? 'cve' : vuln.cwe ? 'cwe' : 'unknown';
                  const securityIssue: SecurityIssue = {
                    reference: vuln.title,
                    severity: vuln.cvssScore,
                    url: vuln.reference,
                    source: source,
                    description: vuln.description
                  };
                  securityIssues.push(securityIssue);
                });
              }

              const container: ComponentContainer = {
                component: {
                  packageUrl: body[0].coordinates,
                  name: '',
                  hash: ''
                },
                matchState: 'PURL',
                catalogDate: '',
                relativePopularity: '',
                securityData: {securityIssues: securityIssues},
                licenseData: undefined
              };

              resolve(container);

              return;
            }

            reject(res);
          }
          reject(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  private sanitizePurl = (purl: PackageURL): string => {
    // Handles golang versions having v in front of them
    while (purl.version?.charAt(0) == 'v') {
      purl.version = purl.version.substring(1);
    }

    return purl.toString().replace('%2F', '/').replace('%2B', '+');
  };

  private getHeaders(): Promise<Headers> {
    return new Promise((resolve, reject) => {
      const meta = ServiceHelpers.getUserAgent();

      const headers = new Headers(meta);

      if (this.user !== '' || this.token !== '') {
        headers.append('Authorization', ServiceHelpers.getBasicAuth(this.user, this.token));
      }

      resolve(headers);
    });
  }
}
