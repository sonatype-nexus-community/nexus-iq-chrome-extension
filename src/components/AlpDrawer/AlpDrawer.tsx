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
import React, {useContext} from 'react';
import {NexusContext} from '../../context/NexusContext';
import {NxDrawer} from '@sonatype/react-shared-components';
import AdvancedLegalDisplay from '../Popup/IQServer/LicensingPage/AdvancedLegalDisplay/AdvancedLegalDisplay';

const AlpDrawer = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  return (
    <NxDrawer
      id="nx-drawer-legal"
      open={nexusContext.showAlpDrawer}
      onClose={nexusContext.toggleAlpDrawer}
      aria-labelledby="drawer-legal-title"
    >
      <NxDrawer.Header>
        <NxDrawer.HeaderTitle id="drawer-legal-title">Advanced Legal Pack</NxDrawer.HeaderTitle>
      </NxDrawer.Header>
      <NxDrawer.Content tabIndex={0}>
        <AdvancedLegalDisplay />
      </NxDrawer.Content>
    </NxDrawer>
  );
};

export default AlpDrawer;
