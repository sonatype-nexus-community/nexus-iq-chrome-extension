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
import {
  NxFieldset,
  NxRadio,
  NxTab,
  NxTabList,
  NxTabPanel,
  NxTabs
} from '@sonatype/react-shared-components';
import React, {useContext, useState} from 'react';
import {NexusContext, NexusContextInterface} from '../../context/NexusContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import {DATA_SOURCES} from '../../utils/Constants';
import IQServerOptionsPage from './IQServer/IQServerOptionsPage';
import OSSIndexOptionsPage from './OSSIndex/OSSIndexOptionsPage';

const Options = (): JSX.Element | null => {
  const [activeTabId, setActiveTabId] = useState(0);

  const [scanType, setScanType] = useLocalStorage('scanType', DATA_SOURCES.OSSINDEX);

  const nexusContext = useContext(NexusContext);

  const renderOptions = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext) {
      return (
        <React.Fragment>
          <NxFieldset label={`Selected Scan Type: ${scanType}`}>
            <NxRadio
              name="scanType"
              value={DATA_SOURCES.OSSINDEX}
              onChange={setScanType}
              isChecked={scanType === DATA_SOURCES.OSSINDEX}
              radioId="scanType-OSS-Index"
            >
              OSS Index
            </NxRadio>
            <NxRadio
              name="scanType"
              value={DATA_SOURCES.NEXUSIQ}
              onChange={setScanType}
              isChecked={scanType === DATA_SOURCES.NEXUSIQ}
              radioId="scanType-IQ-Server"
            >
              IQ Server
            </NxRadio>
          </NxFieldset>

          <NxTabs activeTab={activeTabId} onTabSelect={setActiveTabId}>
            <NxTabList>
              <NxTab>General</NxTab>
              <NxTab>Nexus IQ</NxTab>
              <NxTab>OSS Index</NxTab>
            </NxTabList>
            <NxTabPanel></NxTabPanel>
            <NxTabPanel>
              <IQServerOptionsPage />
            </NxTabPanel>
            <NxTabPanel>
              <OSSIndexOptionsPage />
            </NxTabPanel>
          </NxTabs>
        </React.Fragment>
      );
    }
    return null;
  };

  return renderOptions(nexusContext);
};

export default Options;
