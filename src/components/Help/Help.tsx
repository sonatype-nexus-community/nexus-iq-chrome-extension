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
import {NxH2, NxP, NxPageTitle, NxTile} from '@sonatype/react-shared-components';
import React from 'react';

const Help = (): JSX.Element => {
  const renderHelp = () => {
    return (
      <React.Fragment>
        <h1>
          <NxPageTitle>Sonatype Nexus Browser Extension Help</NxPageTitle>
        </h1>
        <NxTile>
          <NxTile.Header>
            <NxH2>Frequently Asked Questions</NxH2>
          </NxTile.Header>
          <NxTile.Content>
            <NxP>What is an egg?</NxP>
          </NxTile.Content>
        </NxTile>
      </React.Fragment>
    );
  };

  return renderHelp();
};

export default Help;
