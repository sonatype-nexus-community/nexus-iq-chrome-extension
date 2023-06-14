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
import {NxH2, NxPageTitle, NxTile} from '@sonatype/react-shared-components';
import React, {useState} from 'react';
import IQServerOptionsPage from '../Options/IQServer/IQServerOptionsPage';
import { DEFAULT_EXTENSION_SETTINGS, ExtensionSettings } from '../../service/ExtensionSettings';
import { ExtensionContext } from '../../context/NexusContext';
import { MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS } from '../../types/Message';
import { updateExtensionConfiguration } from '../../messages/SettingsMessages';

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser;

function Install() {
  const [extensionConfig, setExtensionConfig] = useState<ExtensionSettings>(DEFAULT_EXTENSION_SETTINGS)

  function handleNewExtensionConfig(settings: ExtensionSettings) {
    console.log(`Install handleNewExtensionConfig`, settings)
    // _browser.runtime.sendMessage({
    //   'type': MESSAGE_REQUEST_TYPE.UPDATE_SETTINGS,
    //   'params': settings
    // }, (response) => {
    //   console.log('Install Response', response)
    //   if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
    //     setExtensionConfig((response.data as ExtensionSettings))
    //   }
    // })
    updateExtensionConfiguration(settings).then((response) => {
      console.log('Install Response', response)
      if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
        console.log('Install Set Extension Response:', response)
        setExtensionConfig((response.data as ExtensionSettings))
      }
    })
  }

  return (
    <ExtensionContext.Provider value={extensionConfig}>
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
            <p className="nx-p nx-page-content--full-width">
              If you are using OSS Index, you are good to go and can skip this. If you want to use
              this extension with Nexus IQ Server, follow the quick setup below!
            </p>
            <IQServerOptionsPage setExtensionConfig={handleNewExtensionConfig}/>
          </NxTile.Content>
        </NxTile>
      </React.Fragment>
    </ExtensionContext.Provider>
  )
}

export default Install;
