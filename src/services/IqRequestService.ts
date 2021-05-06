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

import {ComponentContainer, ComponentDetails} from '../types/ArtifactMessage';
import {ServiceHelpers} from './ServiceHelpers';

export class IqRequestService {
  private readonly xsrfCookieName = 'CLM-CSRF-TOKEN';
  private readonly xsrfHeaderName = 'X-CSRF-TOKEN';

  constructor(
    readonly url: string = 'http://localhost:8070',
    readonly user: string = 'admin',
    readonly token: string = 'admin123'
  ) {}

  public async getComponentDetails(purl: string): Promise<ComponentContainer> {
    await this.canLogin();

    const headers = await this.getHeaders();
    headers.set('Content-Type', 'application/json');
    //CPT Hot fix until library fixed
    purl = purl.replace('%2F', '/').replace('%2B', '+');
    const data = {
      components: [
        {
          packageUrl: purl
        }
      ]
    };

    return new Promise((resolve, reject) => {
      fetch(`${this.url}/api/v2/components/details`, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(data)
      })
        .then(async (res) => {
          if (res.ok) {
            const body = (await res.json()) as ComponentDetails;

            resolve(body.componentDetails[0]);

            return;
          }
          reject(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  canLogin = async (): Promise<void> => {
    const headers = await this.getHeaders();

    return new Promise((resolve, reject) => {
      fetch(`${this.url}/rest/user/session`, {
        method: 'GET',
        headers: headers
      })
        .then(async (res) => {
          if (res.ok) {
            resolve();

            return;
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  private getHeaders(): Promise<Headers> {
    return new Promise((resolve, reject) => {
      const meta = ServiceHelpers.getUserAgent();

      const headers = new Headers(meta);

      headers.append('Authorization', ServiceHelpers.getBasicAuth(this.user, this.token));

      this.getCookie(this.xsrfCookieName, (val: string) => {
        if (val) {
          headers.append(this.xsrfHeaderName, val);
        }

        resolve(headers);
      });
    });
  }

  getCookie = (name: string, cb: any) => {
    chrome.cookies.getAll({name: name}, (cookies: chrome.cookies.Cookie[]) => {
      if (cookies && cookies.length > 0) {
        cb(cookies[0].value);
      }
    });
  };
}
