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
  NxPageTitle,
  NxRadio,
  NxTab,
  NxTabList,
  NxTabPanel,
  NxTabs,
  NxTile,
  NxButton, NxButtonBar
} from '@sonatype/react-shared-components';
import React, {useEffect, useState} from 'react';
import {ExtensionConfigurationContext} from '../../context/NexusContext';
import {DATA_SOURCE} from '../../utils/Constants';
import { MESSAGE_RESPONSE_STATUS } from "../../types/Message"
import GeneralOptionsPage from './General/GeneralOptionsPage';
import IQServerOptionsPage from './IQServer/IQServerOptionsPage';
import OSSIndexOptionsPage from './OSSIndex/OSSIndexOptionsPage';
import { DEFAULT_EXTENSION_SETTINGS, ExtensionConfiguration } from '../../types/ExtensionConfiguration';
import { readExtensionConfiguration, updateExtensionConfiguration } from '../../messages/SettingsMessages';
import { logger, LogLevel } from '../../logger/Logger'


export default function Options() {
  const [activeTabId, setActiveTabId] = useState(0);
  const [extensionConfig, setExtensionConfig] = useState<ExtensionConfiguration>(DEFAULT_EXTENSION_SETTINGS)

  function handleDataSourceChange(e) {
    const newExtensionConfig = extensionConfig
    newExtensionConfig.dataSource = e
    handleNewExtensionConfig(newExtensionConfig)
  }

  function handleNewExtensionConfig(settings: ExtensionConfiguration) {
    logger.logMessage(`Options handleNewExtensionConfig`, LogLevel.DEBUG, settings)
    updateExtensionConfiguration(settings).then((response) => {
      logger.logMessage('Options Response', LogLevel.DEBUG, response)
      if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
        setExtensionConfig((response.data as ExtensionConfiguration))
      }
    })
  }

  function handleSaveClose() {
    // @todo add Save logic
    window.close()
  }

  useEffect(() => {
    if (extensionConfig == DEFAULT_EXTENSION_SETTINGS) {
      readExtensionConfiguration().then((response) => {
        console.log('Options useEffect Response:', response)
        if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
          if (response.data === undefined) {
            setExtensionConfig(DEFAULT_EXTENSION_SETTINGS)
          } else {
            setExtensionConfig((response.data as ExtensionConfiguration))
          }
        }
      })
    }
  })

  return (
    <ExtensionConfigurationContext.Provider value={extensionConfig}>
      <React.Fragment>
        <h1>
          <NxPageTitle>Extension Options</NxPageTitle>
        </h1>

        <NxTile>
          <NxTile.Content>
            <div className="nx-grid-row">
              <section className="nx-grid-col nx-grid-col--66">
                <NxFieldset label={`Current Connection Type: ${extensionConfig.dataSource}`} isRequired>
                  <NxRadio
                    name="scanType"
                    value={DATA_SOURCE.NEXUSIQ}
                    onChange={handleDataSourceChange}
                    isChecked={extensionConfig.dataSource === DATA_SOURCE.NEXUSIQ}
                    radioId="scanType-IQ-Server"
                  >
                    Sonatype IQ Server
                  </NxRadio>
                  <NxRadio
                    name="scanType"
                    value={DATA_SOURCE.OSSINDEX}
                    onChange={handleDataSourceChange}
                    isChecked={extensionConfig.dataSource === DATA_SOURCE.OSSINDEX}
                    radioId="scanType-OSS-Index"
                  >
                    Sonatype OSS Index
                  </NxRadio>
                </NxFieldset>
              </section>
              <section className="nx-grid-col nx-grid-col--33">
              <NxButtonBar>
                <NxButton
                    onClick={handleSaveClose}>
                  <span>Save & Close</span>
                </NxButton>
              </NxButtonBar>
              </section>
            </div>

            <NxTabs activeTab={activeTabId} onTabSelect={setActiveTabId}>
              <NxTabList>
                <NxTab key={DATA_SOURCE.NEXUSIQ}>Sonatype IQ Server</NxTab>
                <NxTab key={DATA_SOURCE.OSSINDEX}>Sonatype OSS Index</NxTab>
                <NxTab key={`GENERAL`}>General Options</NxTab>
              </NxTabList>
              <NxTabPanel>
                <IQServerOptionsPage setExtensionConfig={handleNewExtensionConfig} />
              </NxTabPanel>
              <NxTabPanel>
                <OSSIndexOptionsPage />
              </NxTabPanel>
              <NxTabPanel>
                <GeneralOptionsPage />
              </NxTabPanel>
            </NxTabs>
          </NxTile.Content>
        </NxTile>
      </React.Fragment>
    </ExtensionConfigurationContext.Provider>
  );
}