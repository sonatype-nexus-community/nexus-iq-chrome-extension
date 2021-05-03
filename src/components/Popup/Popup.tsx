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
import {NxTab, NxTabList, NxTabPanel, NxTabs} from '@sonatype/react-shared-components';
import ComponentInfoPage from './IQServer/ComponentInfoPage/ComponentInfoPage';
import LicensingPage from './IQServer/LicensingPage/LicensingPage';
import SecurityPage from './IQServer/SecurityPage/SecurityPage';
import React, {useContext, useState} from 'react';
import {NexusContext, NexusContextInterface} from '../../context/NexusContext';
import LiteComponentInfoPage from './OSSIndex/LiteComponentInfoPage/LiteComponentInfoPage';
import {DATA_SOURCES} from '../../utils/Constants';

const Popup = () => {
  const [activeTabId, setActiveTabId] = useState(0);

  const nexusContext = useContext(NexusContext);

  const renderPopup = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.componentDetails &&
      nexusContext.scanType === DATA_SOURCES.NEXUSIQ
    ) {
      return (
        <NxTabs activeTab={activeTabId} onTabSelect={setActiveTabId}>
          <NxTabList>
            <NxTab>Component Info</NxTab>
            <NxTab>Security</NxTab>
            <NxTab>Licensing</NxTab>
          </NxTabList>
          <NxTabPanel>
            <ComponentInfoPage></ComponentInfoPage>
          </NxTabPanel>
          <NxTabPanel>
            <SecurityPage></SecurityPage>
          </NxTabPanel>
          <NxTabPanel>
            <LicensingPage></LicensingPage>
          </NxTabPanel>
        </NxTabs>
      );
    } else if (
      nexusContext &&
      nexusContext.componentDetails &&
      nexusContext.scanType === DATA_SOURCES.OSSINDEX
    ) {
      console.info('Rendering OSS Index View');
      return (
        <NxTabs activeTab={activeTabId} onTabSelect={setActiveTabId}>
          <NxTabList>
            <NxTab>Component Info</NxTab>
          </NxTabList>
          <NxTabPanel>
            <LiteComponentInfoPage></LiteComponentInfoPage>
          </NxTabPanel>
        </NxTabs>
      );
    }
    return null;
  };

  return renderPopup(nexusContext);
};

export default Popup;
