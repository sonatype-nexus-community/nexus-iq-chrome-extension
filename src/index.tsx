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
import React from 'react'
import ReactDOM from 'react-dom/client'
import ExtensionPopup from './components/Popup/ExtensionPopup'
import { UI_MODE, UiContext } from './context/UiContext'

/**
 * This is essentially the UI that appears in the Extension Popup or Side Panel.
 */

const container = document.getElementById('ui')
const root = ReactDOM.createRoot(container)
root.render(
    <React.StrictMode>
        <UiContext.Provider value={UI_MODE.POPUP}>
            <ExtensionPopup />
        </UiContext.Provider>
    </React.StrictMode>
)
