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

export class IqRequestService {
  constructor(
    readonly url: string = 'http://localhost:8070',
    readonly user: string = 'admin',
    readonly token: string = 'admin123') {}

  public async getComponentDetails(purl: string): Promise<any> {
    await this.canLogin();

    const headers = this.getHeaders();
    headers.set('Content-Type', 'application/json');

    const data = {
      components: [{
        packageUrl: purl
      }]
    };

    return new Promise((resolve, reject) => {
      fetch(`${this.url}/api/v2/components/details`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      }).then(async (res) => {
        if (res.ok) {
          const body = await res.json();
          console.debug(body);
          resolve(body);
          return;
        }
        reject(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  canLogin = async (): Promise<void> => {
    const headers = this.getHeaders();

    return new Promise((resolve, reject) => {
      fetch(`${this.url}/rest/user/session`, {
        method: 'GET',
        headers: headers
      }).then(async (res) => {
        if (res.ok) {
          resolve();
        }
      }).catch((err) => {
        reject(err);
      });
    })
  }

  private getHeaders(): Headers {
    const meta = this.getUserAgent();

    const headers = new Headers(meta);
    headers.append('Authorization', this.getBasicAuth());

    return headers;
  }

  private getUserAgent() {
    return { 'User-Agent': `Nexus_IQ_Chrome_Extension/0.0.1` };
  }

  private getBasicAuth(): string {
    const usernameToken = this.user + ":" + this.token;
    const _base64 = btoa(usernameToken);
    return `Basic ${_base64}`;
  }
}
