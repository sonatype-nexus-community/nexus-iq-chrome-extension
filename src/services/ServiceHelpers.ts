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

export class ServiceHelpers {
  static getBasicAuth = (user: string, token: string): string => {
    const usernameToken = user + ':' + token;
    const _base64 = btoa(usernameToken);

    return `Basic ${_base64}`;
  };

  static getUserAgent = (): HeadersInit => {
    return {'User-Agent': `Nexus_IQ_Chrome_Extension/0.0.1`};
  };
}
