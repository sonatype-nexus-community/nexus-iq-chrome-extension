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

import fetchMock from 'fetch-mock-jest';
import {OSSIndexRequestService} from './OSSIndexRequestService';

const ossIndexRequestService = new OSSIndexRequestService();

const ossIndexResponse = [
  {
    coordinates: 'pkg:npm/jquery@3.5.1',
    description: 'JavaScript library for DOM operations',
    reference:
      'https://ossindex.sonatype.org/component/pkg:npm/jquery@3.5.1?utm_source=mozilla&utm_medium=integration&utm_content=5.0',
    vulnerabilities: []
  }
];

const ossIndexVulnerableResponse = [
  {
    coordinates: 'pkg:npm/jquery@3.1.3',
    description: 'JavaScript library for DOM operations',
    reference:
      'https://ossindex.sonatype.org/component/pkg:npm/jquery@3.1.3?utm_source=mozilla&utm_medium=integration&utm_content=5.0',
    vulnerabilities: [
      {
        id: '11b6563a-ead6-4040-83e5-455f36519d1b',
        displayName: 'CVE-2019-11358',
        title:
          '[CVE-2019-11358]  Improper Neutralization of Input During Web Page Generation ("Cross-site Scripting")',
        description:
          'jQuery before 3.4.0, as used in Drupal, Backdrop CMS, and other products, mishandles jQuery.extend(true, {}, ...) because of Object.prototype pollution. If an unsanitized source object contained an enumerable __proto__ property, it could extend the native Object.prototype.',
        cvssScore: 6.1,
        cvssVector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
        cve: 'CVE-2019-11358',
        reference:
          'https://ossindex.sonatype.org/vulnerability/11b6563a-ead6-4040-83e5-455f36519d1b?component-type=npm&component-name=jquery&utm_source=mozilla&utm_medium=integration&utm_content=5.0'
      },
      {
        id: '4dc10b07-91de-4bd1-8f56-00d718a467a3',
        displayName: 'CVE-2020-11023',
        title:
          '[CVE-2020-11023] In jQuery versions greater than or equal to 1.0.3 and before 3.5.0, passing HTML...',
        description:
          "In jQuery versions greater than or equal to 1.0.3 and before 3.5.0, passing HTML containing <option> elements from untrusted sources - even after sanitizing it - to one of jQuery's DOM manipulation methods (i.e. .html(), .append(), and others) may execute untrusted code. This problem is patched in jQuery 3.5.0.",
        cvssScore: 6.1,
        cvssVector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
        cve: 'CVE-2020-11023',
        reference:
          'https://ossindex.sonatype.org/vulnerability/4dc10b07-91de-4bd1-8f56-00d718a467a3?component-type=npm&component-name=jquery&utm_source=mozilla&utm_medium=integration&utm_content=5.0'
      },
      {
        id: 'ccbcd22c-ecdd-42c3-b76a-73eacbc40d98',
        displayName: 'OSSINDEX-73ea-cbc4-0d98',
        title:
          "CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')",
        description:
          'The software does not neutralize or incorrectly neutralizes user-controllable input before it is placed in output that is used as a web page that is served to other users.',
        cvssScore: 6.1,
        cvssVector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
        cwe: 'CWE-79',
        reference:
          'https://ossindex.sonatype.org/vulnerability/ccbcd22c-ecdd-42c3-b76a-73eacbc40d98?component-type=npm&component-name=jquery&utm_source=mozilla&utm_medium=integration&utm_content=5.0'
      },
      {
        id: '7ea698d9-d38b-4f6f-9a39-79b72d4fe248',
        displayName: 'CVE-2020-11022',
        title:
          '[CVE-2020-11022] In jQuery versions greater than or equal to 1.2 and before 3.5.0, passing HTML f...',
        description:
          "In jQuery versions greater than or equal to 1.2 and before 3.5.0, passing HTML from untrusted sources - even after sanitizing it - to one of jQuery's DOM manipulation methods (i.e. .html(), .append(), and others) may execute untrusted code. This problem is patched in jQuery 3.5.0.",
        cvssScore: 6.1,
        cvssVector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
        cve: 'CVE-2020-11022',
        reference:
          'https://ossindex.sonatype.org/vulnerability/7ea698d9-d38b-4f6f-9a39-79b72d4fe248?component-type=npm&component-name=jquery&utm_source=mozilla&utm_medium=integration&utm_content=5.0'
      }
    ]
  }
];

beforeEach(() => {
  fetchMock.reset();
  fetchMock
    .post(
      {
        url: 'end:api/v3/component-report',
        body: {
          coordinates: ['pkg:npm/jquery@3.5.1']
        }
      },
      ossIndexResponse
    )
    .post(
      {
        url: 'end:api/v3/component-report',
        body: {
          coordinates: ['pkg:npm/jquery@3.1.3']
        }
      },
      ossIndexVulnerableResponse,
      {
        overwriteRoutes: false
      }
    );
});

describe('OSS Index Request Service', () => {
  test('can get a response given a valid purl with no vulnerabilities', async () => {
    const res = await ossIndexRequestService.getComponentDetails('pkg:npm/jquery@3.5.1');

    expect(res).toBeDefined();
    expect(res.length).toBe(1);
    expect(res[0].coordinates).toBe('pkg:npm/jquery@3.5.1');
    expect(res[0].description).toBe('JavaScript library for DOM operations');
    expect(res[0].reference).toBe(
      'https://ossindex.sonatype.org/component/pkg:npm/jquery@3.5.1?utm_source=mozilla&utm_medium=integration&utm_content=5.0'
    );
    expect(res[0].vulnerabilities.length).toBe(0);
  });

  test('can get a response given a valid purl with vulnerabilities', async () => {
    const res = await ossIndexRequestService.getComponentDetails('pkg:npm/jquery@3.1.3');

    expect(res).toBeDefined();
    expect(res.length).toBe(1);
    expect(res[0].coordinates).toBe('pkg:npm/jquery@3.1.3');
    expect(res[0].description).toBe('JavaScript library for DOM operations');
    expect(res[0].reference).toBe(
      'https://ossindex.sonatype.org/component/pkg:npm/jquery@3.1.3?utm_source=mozilla&utm_medium=integration&utm_content=5.0'
    );
    expect(res[0].vulnerabilities.length).toBe(4);
  });
});
