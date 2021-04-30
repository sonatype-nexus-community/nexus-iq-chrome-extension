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
import React from 'react';
import { ServiceHelpers } from './ServiceHelpers';

describe('Service Helpers', () => {
  test('allow you to get a proper user agent', () => {
    const userAgent = ServiceHelpers.getUserAgent();

    expect(userAgent).toBeDefined();
    expect(userAgent).toEqual({'User-Agent': `Nexus_IQ_Chrome_Extension/0.0.1`});
  });

  test('allow you to get a Basic Auth string', () => {
    const baseAuth = ServiceHelpers.getBasicAuth("admin", "admin123");

    expect(baseAuth).toBeDefined();
    expect(baseAuth).toBe("Basic YWRtaW46YWRtaW4xMjM=");
  });
});
