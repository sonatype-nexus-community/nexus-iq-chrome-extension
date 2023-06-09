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
import React, {useContext, useEffect, useState} from 'react';
import {NexusContext, NexusContextInterface} from '../../context/NexusContext';
import {DATA_SOURCES} from '../../utils/Constants';
import GeneralOptionsPage from './General/GeneralOptionsPage';
import IQServerOptionsPage from './IQServer/IQServerOptionsPage';
import OSSIndexOptionsPage from './OSSIndex/OSSIndexOptionsPage';
import {MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS} from '../../types/Message';
import {ExtensionSettings} from "../../service/ExtensionSettings";
import {getSettings} from "../../messages/SettingsMessages";
// import {
//   MessageRequest, MessageResponse, MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS
// } from "../../types/Message";

const SCAN_TYPE = 'scanType';

const Options = (): JSX.Element | null => {
  const [activeTabId, setActiveTabId] = useState(0);
  const onClick = () => window.close();

  const [scanType, setScanType] = useState<string>(DATA_SOURCES.NEXUSIQ);
  const [extSettings, setExtSettings] = useState<ExtensionSettings>();
  const nexusContext = useContext(NexusContext);

  const firstTimeLoadSettings = () => {
    getSettings().then((settings) => {
      if (settings.status == MESSAGE_RESPONSE_STATUS.SUCCESS && settings.data) {
        console.log('Got Extension Settings in Top-Level Options Page: ', settings)
        setExtSettings(settings.data['settings'] as ExtensionSettings)
      }
    })
  }

  useEffect(() => {
    firstTimeLoadSettings();
  }, []);

  //
  // useEffect(() => {
  //   async () => {
  //     console.log("New Extension Settings")
  //     await chrome.runtime.sendMessage({"type": MESSAGE_REQUEST_TYPE.GET_SETTINGS}, (response) => {
  //       console.log(response);
  //       setExtSettings(response.data);
  //     });
  //   };
  // }, []);


  // (async () => {
  //   console.log("New Extension Settings")
  //   await chrome.runtime.sendMessage({"type": MESSAGE_REQUEST_TYPE.GET_SETTINGS}, (response) => {
  //     console.log(response);
  //     setExtSettings(response);
  //   });

    // console.log("New getApplications")
    // await chrome.runtime.sendMessage({"type": "getApplications"}, (response) => {
    //   console.log(response);
    // });
    // do something with response here, not outside the function    
  // })();

  // useEffect(() => {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   chrome.storage.local.get((items: {[key: string]: any}) => {
  //     if (items[SCAN_TYPE] !== undefined) {
  //       setScanType(items[SCAN_TYPE]);
  //     }
  //   });
  // }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setItem = (func: any, value: any, key: string) => {
    func(value);
    chrome.storage.local.set({[key]: value});
    if (scanType === DATA_SOURCES.NEXUSIQ) {
      setActiveTabId(1);
    } else if (scanType === DATA_SOURCES.OSSINDEX) {
      setActiveTabId(0);
    } else {
      setActiveTabId(2);
    }
  };

  const renderOptions = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext) {
      return (
        <React.Fragment>
          <h1>
            <NxPageTitle>Options</NxPageTitle>
          </h1>

          <NxTile>
            <NxTile.Content>
              {/*<NxForm.RequiredFieldNotice />*/}
              <div className="nx-grid-row">
              <section className="nx-grid-col nx-grid-col--66">
                <strong>SETTINGS: {extSettings?.host}</strong>
              <NxFieldset label={`Current Connection Type: ${scanType}`} isRequired>

                <NxRadio
                  name={SCAN_TYPE}
                  value={DATA_SOURCES.NEXUSIQ}
                  onChange={(event) => setItem(setScanType, event, SCAN_TYPE)}
                  isChecked={scanType === DATA_SOURCES.NEXUSIQ}
                  radioId="scanType-IQ-Server"
                >
                  Sonatype IQ Server
                </NxRadio>
                <NxRadio
                  name={SCAN_TYPE}
                  value={DATA_SOURCES.OSSINDEX}
                  onChange={(event) => setItem(setScanType, event, SCAN_TYPE)}
                  isChecked={scanType === DATA_SOURCES.OSSINDEX}
                  radioId="scanType-OSS-Index"
                >
                  Sonatype OSS Index
                </NxRadio>

              </NxFieldset>
              </section>
              <section className="nx-grid-col nx-grid-col--33">
              <NxButtonBar>
                <NxButton
                    onClick={onClick}>
                  <span>Save & Close</span>
                </NxButton>
              </NxButtonBar>
              </section>
              </div>

              <NxTabs activeTab={activeTabId} onTabSelect={setActiveTabId}>
                <NxTabList>
                  <NxTab key={DATA_SOURCES.NEXUSIQ}>Sonatype IQ Server</NxTab>
                  <NxTab key={DATA_SOURCES.OSSINDEX}>Sonatype OSS Index</NxTab>
                  <NxTab key={`GENERAL`}>General Options</NxTab>
                </NxTabList>
                <NxTabPanel>
                  <IQServerOptionsPage extSettings = {extSettings}/>
                </NxTabPanel>
                <NxTabPanel>
                  <OSSIndexOptionsPage extSettings = {extSettings} />
                </NxTabPanel>
                <NxTabPanel>
                  <GeneralOptionsPage extSettings = {extSettings}/>
                </NxTabPanel>
              </NxTabs>
            </NxTile.Content>
          </NxTile>
        </React.Fragment>
      );
    }
    return null;
  };

  return renderOptions(nexusContext);
};

export default Options;
