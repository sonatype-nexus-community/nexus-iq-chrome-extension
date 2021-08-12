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
import IQServerOptionsPage from '../Options/IQServer/IQServerOptionsPage';

const Install = (): JSX.Element => {
  const render = () => {
    return (
      <React.Fragment>
        <h1>
          <NxPageTitle>
            &#127881; Thanks for installing the Sonatype Nexus Browser Extension &#127881;
          </NxPageTitle>
        </h1>
        <NxTile>
          <NxTile.Header>
            <NxH2>Getting Started</NxH2>
          </NxTile.Header>
          <NxTile.Content>
            <NxP>
              If you are using OSS Index, you are good to go and can skip this. If you want to use
              this extension with Nexus IQ Server, follow the quick setup below!
            </NxP>
            <IQServerOptionsPage />
          </NxTile.Content>
        </NxTile>
      </React.Fragment>
    );
  };

  return render();
};

export default Install;
