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
import React, {useContext, useEffect, useState} from 'react';
import {NexusContext, NexusContextInterface} from '../../context/NexusContext';
import {DATA_SOURCES} from '../../utils/Constants';
import IQServerOptionsPage from './IQServer/IQServerOptionsPage';
import OSSIndexOptionsPage from './OSSIndex/OSSIndexOptionsPage';

const SCAN_TYPE = 'scanType';

const Options = (): JSX.Element | null => {
  const [activeTabId, setActiveTabId] = useState(0);

  const [scanType, setScanType] = useState<string>(DATA_SOURCES.OSSINDEX);

  const nexusContext = useContext(NexusContext);

  useEffect(() => {
    chrome.storage.local.get((items: {[key: string]: any}) => {
      if (items[SCAN_TYPE]) {
        setScanType(items[SCAN_TYPE]);
      }
    });
  }, []);

  const setItem = (func: any, value: any, key: string) => {
    func(value);
    chrome.storage.local.set({[key]: value});
  };

  const renderOptions = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext) {
      return (
        <section className="nx-tile nx-viewport-sized__container">
          <header className="nx-tile-header">
            <div className="nx-tile-header__title">
              <h2 className="nx-h2">Options</h2>
            </div>
          </header>
          <div className="nx-tile-content nx-viewport-sized__container">
            <NxFieldset label={`Selected Scan Type: ${scanType}`} isRequired>
              <NxRadio
                name={SCAN_TYPE}
                value={DATA_SOURCES.OSSINDEX}
                onChange={(event) => setItem(setScanType, event, SCAN_TYPE)}
                isChecked={scanType === DATA_SOURCES.OSSINDEX}
                radioId="scanType-OSS-Index"
              >
                OSS Index
              </NxRadio>
              <NxRadio
                name={SCAN_TYPE}
                value={DATA_SOURCES.NEXUSIQ}
                onChange={(event) => setItem(setScanType, event, SCAN_TYPE)}
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
          </div>
        </section>
      );
    }
    return null;
  };

  return renderOptions(nexusContext);
};

export default Options;
