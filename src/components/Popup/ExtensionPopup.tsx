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

import React, { useEffect, useState } from "react";
import { ExtensionConfigurationContext, NexusContext } from "../../context/NexusContext";
import AlpDrawer from "../AlpDrawer/AlpDrawer";
import Popup from "./Popup";
import { DEFAULT_EXTENSION_SETTINGS, ExtensionConfiguration } from "../../types/ExtensionConfiguration";
import { readExtensionConfiguration } from "../../messages/SettingsMessages";
import { MESSAGE_RESPONSE_STATUS } from "../../types/Message";

export default function ExtensionPopup() {
    const [extensionConfig, setExtensionConfig] = useState<ExtensionConfiguration>(DEFAULT_EXTENSION_SETTINGS)

    useEffect(() => {
        if (extensionConfig == undefined || extensionConfig == DEFAULT_EXTENSION_SETTINGS) {
          readExtensionConfiguration().then((response) => {
            console.log('ExtensionPopup useEffect Response:', response)
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
            {/* <AlpDrawer /> */}
            <div className="nx-page-content">
                <main className="nx-page-main nx-viewport-sized">
                    <Popup />
                </main>
            </div>
        </ExtensionConfigurationContext.Provider>
    )
}