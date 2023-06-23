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

import { BrowserExtensionLogger, LogLevel } from '../logger/Logger'
import { ExtensionConfiguration } from '../types/ExtensionConfiguration'
import { MessageResponse, MESSAGE_RESPONSE_STATUS } from '../types/Message'

const SETTINGS_STORAGE_KEY = 'settings'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser

/**
 * This file contains handlers for processing messages that relate to manging this Extensions
 * settings.
 */

const logger = new BrowserExtensionLogger(LogLevel.DEBUG)

export async function readExtensionConfiguration(): Promise<MessageResponse> {
    return _browser.storage.local
        .get([SETTINGS_STORAGE_KEY])
        .then((result) => {
            if (chrome.runtime.lastError) console.error('Failed reading local storage')
            logger.logMessage('Read Extension Settings from Local Storage', LogLevel.DEBUG, result)
            return {
                status: MESSAGE_RESPONSE_STATUS.SUCCESS,
                data: result.settings,
            }
        })
        .catch((err) => {
            return {
                status: MESSAGE_RESPONSE_STATUS.UNKNOWN_ERROR,
                status_detail: {
                    message: `Error reading extension settings from local storage: ${err} - ${chrome.runtime.lastError?.message}`,
                },
            }
        })
}

export async function updateExtensionConfiguration(settings: ExtensionConfiguration): Promise<MessageResponse> {
    return _browser.storage.local
        .set({ [SETTINGS_STORAGE_KEY]: settings })
        .then(() => {
            if (chrome.runtime.lastError) console.error('Failed writing local storage')
            logger.logMessage(
                'Set Extension Settings in Local Storage',
                LogLevel.DEBUG,
                settings,
                chrome.runtime.lastError
            )
            return readExtensionConfiguration()
        })
        .catch((err) => {
            return {
                status: MESSAGE_RESPONSE_STATUS.UNKNOWN_ERROR,
                status_detail: {
                    message: `Error storing in local storage: ${err} - ${chrome.runtime.lastError?.message}`,
                },
            }
        })
}
