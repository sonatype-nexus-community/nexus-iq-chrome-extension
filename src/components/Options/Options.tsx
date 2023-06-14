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
import {ExtensionContext, NexusContext, NexusContextInterface} from '../../context/NexusContext';
import {DATA_SOURCE, DATA_SOURCES} from '../../utils/Constants';
import { MessageRequest, MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS } from "../../types/Message"
import GeneralOptionsPage from './General/GeneralOptionsPage';
import IQServerOptionsPage from './IQServer/IQServerOptionsPage';
import OSSIndexOptionsPage from './OSSIndex/OSSIndexOptionsPage';
import { DEFAULT_EXTENSION_SETTINGS, ExtensionSettings } from '../../service/ExtensionSettings';
import { readExtensionConfiguration, updateExtensionConfiguration } from '../../messages/SettingsMessages';


// const SCAN_TYPE = 'scanType';

// const Options = (): JSX.Element | null => {
//   const [activeTabId, setActiveTabId] = useState(0);
//   const onClick = () => window.close();

//   const [scanType, setScanType] = useState<string>(DATA_SOURCES.OSSINDEX);

//   const nexusContext = useContext(NexusContext);

//   (async () => {
//     console.log("New Extension Settings")
//     await chrome.runtime.sendMessage({"type": MESSAGE_REQUEST_TYPE.GET_SETTINGS}, (response) => {
//       console.log(response);
//     });

//     // console.log("New getApplications")
//     // await chrome.runtime.sendMessage({"type": "getApplications"}, (response) => {
//     //   console.log(response);
//     // });
//     // do something with response here, not outside the function    
//   })();

//   useEffect(() => {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     chrome.storage.local.get((items: {[key: string]: any}) => {
//       if (items[SCAN_TYPE] !== undefined) {
//         setScanType(items[SCAN_TYPE]);
//       }
//     });
//   }, []);

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const setItem = (func: any, value: any, key: string) => {
//     func(value);
//     chrome.storage.local.set({[key]: value});
//     if (scanType === DATA_SOURCES.NEXUSIQ) {
//       setActiveTabId(1);
//     } else if (scanType === DATA_SOURCES.OSSINDEX) {
//       setActiveTabId(0);
//     } else {
//       setActiveTabId(2);
//     }
//   };

//   const renderOptions = (nexusContext: NexusContextInterface | undefined) => {
//     if (nexusContext) {
//       return (
//         <React.Fragment>
//           <h1>
//             <NxPageTitle>Maury  Options</NxPageTitle>
//           </h1>

//           <NxTile>
//             <NxTile.Content>
//               {/*<NxForm.RequiredFieldNotice />*/}
//               <div className="nx-grid-row">
//               <section className="nx-grid-col nx-grid-col--66">
//               <NxFieldset label={`Current Connection Type: ${scanType}`} isRequired>

//                 <NxRadio
//                   name={SCAN_TYPE}
//                   value={DATA_SOURCES.NEXUSIQ}
//                   onChange={(event) => setItem(setScanType, event, SCAN_TYPE)}
//                   isChecked={scanType === DATA_SOURCES.NEXUSIQ}
//                   radioId="scanType-IQ-Server"
//                 >
//                   Sonatype IQ Server
//                 </NxRadio>
//                 <NxRadio
//                   name={SCAN_TYPE}
//                   value={DATA_SOURCES.OSSINDEX}
//                   onChange={(event) => setItem(setScanType, event, SCAN_TYPE)}
//                   isChecked={scanType === DATA_SOURCES.OSSINDEX}
//                   radioId="scanType-OSS-Index"
//                 >
//                   Sonatype OSS Index
//                 </NxRadio>

//               </NxFieldset>
//               </section>
//               <section className="nx-grid-col nx-grid-col--33">
//               <NxButtonBar>
//                 <NxButton
//                     onClick={onClick}>
//                   <span>Save & Close</span>
//                 </NxButton>
//               </NxButtonBar>
//               </section>
//               </div>

//               <NxTabs activeTab={activeTabId} onTabSelect={setActiveTabId}>
//                 <NxTabList>
//                   <NxTab key={DATA_SOURCES.NEXUSIQ}>Sonatype IQ Server</NxTab>
//                   <NxTab key={DATA_SOURCES.OSSINDEX}>Sonatype OSS Index</NxTab>
//                   <NxTab key={`GENERAL`}>General Options</NxTab>
//                 </NxTabList>
//                 <NxTabPanel>
//                   <IQServerOptionsPage />
//                 </NxTabPanel>
//                 <NxTabPanel>
//                   <OSSIndexOptionsPage />
//                 </NxTabPanel>
//                 <NxTabPanel>
//                   <GeneralOptionsPage />
//                 </NxTabPanel>
//               </NxTabs>
//             </NxTile.Content>
//           </NxTile>
//         </React.Fragment>
//       );
//     }
//     return null;
//   };

//   return renderOptions(nexusContext);
// };

// export default Options;

export default function Options() {
  const [activeTabId, setActiveTabId] = useState(0);
  const [extensionConfig, setExtensionConfig] = useState<ExtensionSettings>(DEFAULT_EXTENSION_SETTINGS)

  function handleDataSourceChange(e) {
    const newExtensionConfig = extensionConfig
    newExtensionConfig.dataSource = e
    handleNewExtensionConfig(newExtensionConfig)
  }

  function handleNewExtensionConfig(settings: ExtensionSettings) {
    console.log(`Options handleNewExtensionConfig`, settings)
    updateExtensionConfiguration(settings).then((response) => {
      console.log('Options Response', response)
      if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
        setExtensionConfig((response.data as ExtensionSettings))
      }
    })
    // _browser.runtime.sendMessage({
    //   'type': MESSAGE_REQUEST_TYPE.UPDATE_SETTINGS,
    //   'params': settings
    // }, (response) => {
    //   console.log('Options Response', response)
    //   if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
    //     setExtensionConfig((response.data as ExtensionSettings))
    //   }
    // })
  }

  function handleSaveClose() {
    // @todo add Save logic
    window.close()
  }

  useEffect(() => {
    if (extensionConfig == undefined || extensionConfig == DEFAULT_EXTENSION_SETTINGS) {
      readExtensionConfiguration().then((response) => {
        console.log('Options useEffect Response:', response)
        if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
          if (response.data === undefined) {
            setExtensionConfig(DEFAULT_EXTENSION_SETTINGS)
          } else {
            setExtensionConfig((response.data as ExtensionSettings))
          }
        }
      })
    }
  })

  return (
    <ExtensionContext.Provider value={extensionConfig}>
      <React.Fragment>
        <h1>
          <NxPageTitle>Extension Options</NxPageTitle>
        </h1>

        <NxTile>
          <NxTile.Content>
            {/*<NxForm.RequiredFieldNotice />*/}
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
    </ExtensionContext.Provider>
  );
}