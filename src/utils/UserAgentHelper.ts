/*
 * Copyright 2021-Present Sonatype Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import os from 'os';

export class UserAgentHelper {
  public static async getUserAgent(browser: boolean, product: string, version: string): Promise<string> {
    if (browser) {
      return this.getUserAgentBrowser(product, version);
    }
    return this.getUserAgentNode(product, version);
  }

  private static async getUserAgentNode(product: string, version: string): Promise<string> {
    const nodeVersion = process.versions;
    const environment = 'NodeJS';
    const environmentVersion = nodeVersion.node;
    const system = `${os.type()} ${os.release()}`;

    return `${product}/${version} (${environment} ${environmentVersion}; ${system})`;
  }

  private static getUserAgentBrowser(product: string, version: string): string {
    return `${product}/${version}`;
  }
}
