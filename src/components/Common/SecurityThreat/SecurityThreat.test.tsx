/**
 * @jest-environment jsdom
 */
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
import {SecurityData} from '@sonatype/js-sona-types';
import React from 'react';
import renderer from 'react-test-renderer';
import SecurityThreat from './SecurityThreat';

const securityData: SecurityData = {
  securityIssues: [
    {
      id: 'test',
      source: 'cve',
      reference: 'reference',
      severity: 9.9,
      vector: 'vector',
      url: 'http://aurltosomewhere.com',
      description: 'test description'
    }
  ]
};

describe('<SecurityThreat />', () => {
  test('renders null when provided no props', () => {
    const component = renderer.create(<SecurityThreat />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders properly when provided AWESOME props', () => {
    const component = renderer.create(<SecurityThreat securityData={securityData} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
