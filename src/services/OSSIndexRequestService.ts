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

export class OSSIndexRequestService {
    private readonly xsrfCookieName = "CLM-CSRF-TOKEN";
    private readonly xsrfHeaderName = "X-CSRF-TOKEN";
    
    constructor(
      readonly url: string = 'https://ossindex.sonatype.org/',
      readonly user: string,
      readonly token: string) {}
  
    public async getComponentDetails(purl: string): Promise<any> {
  
      const headers = await this.getHeaders();
      headers.set('Content-Type', 'application/json');
  
      const data = {
        coordinates: [purl]
      };
  
      return new Promise((resolve, reject) => {
  
        fetch(`${this.url}api/v3/component-report`, {
          method: 'POST',
          headers: headers,
          mode: 'cors',
          body: JSON.stringify(data)
        }).then(async (res) => {
          if (res.ok) {
            const body = await res.json();
            resolve(body);
  
            return;
          }
          reject(res);
        }).catch((err) => {
          reject(err);
        });
      });
    }
  
  
    private getHeaders(): Promise<Headers> {
      return new Promise((resolve, reject) => {
        const meta = this.getUserAgent();
  
        const headers = new Headers(meta);
        
        if (this.user !== '' || this.token !== '') {
            headers.append('Authorization', this.getBasicAuth());
        }
        
    
        this.getCookie(this.xsrfCookieName, (val: string) => {
          if (val) {
            headers.append(this.xsrfHeaderName, val);
          }
  
          resolve(headers);
        });
      })
    }
  
    private getUserAgent() {
      return { 'User-Agent': `Nexus_IQ_Chrome_Extension/0.0.1` };
    }
  
    private getBasicAuth(): string {
      const usernameToken = this.user + ":" + this.token;
      const _base64 = btoa(usernameToken);
  
      return `Basic ${_base64}`;
    }
  
    getCookie = (name: string, cb: any) => {
      chrome.cookies.getAll({name: name}, (cookies: chrome.cookies.Cookie[]) => {
        if (cookies && cookies.length > 0) {
          cb(cookies[0].value);
        }
      });
    }
  }
  