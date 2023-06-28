/* eslint @typescript-eslint/no-var-requires: "off" */
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
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft, faArrowRight, faCog, faPlay, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import {
    NxGlobalSidebarFooter,
    NxGlobalSidebarNavigation,
    NxGlobalSidebarNavigationLink,
    NxPageMain,
    NxStatefulGlobalSidebar,
} from '@sonatype/react-shared-components'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { homepage as packageHomepage, version as packageVersion } from '../package.json'
import { NexusOptionsContainer } from './NexusOptionsContainer'
import { logger, LogLevel } from './logger/Logger'
import { MESSAGE_REQUEST_TYPE } from './types/Message'
import { readExtensionConfiguration } from './messages/SettingsMessages'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser

const container = document.getElementById('ui')
const root = ReactDOM.createRoot(container)
const search = window.location.search
const params = new URLSearchParams(search)
const install = params.has('install')
const help = params.has('help')

root.render(
    <React.StrictMode>
        <NxStatefulGlobalSidebar
            isDefaultOpen={true}
            toggleCloseIcon={faArrowRight as IconDefinition}
            toggleOpenIcon={faArrowLeft as IconDefinition}
            logoImg='images/sonatype-lifecycle-logo-nav-white.svg'
            logoAltText='Sonatype Browser Extension'
            logoLink='#'
        >
            <NxGlobalSidebarNavigation>
                <NxGlobalSidebarNavigationLink
                    icon={faPlay as IconDefinition}
                    text='Getting Started'
                    href='options.html?install'
                />
                <NxGlobalSidebarNavigationLink
                    icon={faQuestionCircle as IconDefinition}
                    text='Help'
                    href='options.html?help'
                />
                <NxGlobalSidebarNavigationLink icon={faCog as IconDefinition} text='Options' href='options.html' />
            </NxGlobalSidebarNavigation>
            <NxGlobalSidebarFooter
                supportText={`Request Support`}
                supportLink={packageHomepage}
                releaseText={`Release ${packageVersion}`}
                productTagLine='Powered by Sonatype IQ Server & Sonatype OSS Index'
                showCreatedBy={true}
            />
        </NxStatefulGlobalSidebar>
        <NxPageMain>
            <NexusOptionsContainer install={install} help={help} />
        </NxPageMain>
    </React.StrictMode>
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
_browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    logger.logMessage('Options Request received', LogLevel.INFO, request)
    console.info('OptionsMessage received: ', request)

    switch (request.type) {
        case MESSAGE_REQUEST_TYPE.GET_SETTINGS:
            readExtensionConfiguration().then((response) => {
                response.status_detail = {
                    message: 'Proving this is where the response comes from Options!',
                }
                sendResponse(response)
            })
            break
    }
})
