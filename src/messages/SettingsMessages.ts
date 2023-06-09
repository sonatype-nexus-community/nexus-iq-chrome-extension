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

import { ExtensionError } from '../error/ExtensionError';
import { BrowserExtensionLogger, LogLevel } from '../logger/Logger';
import { 
    getSettings as getExtensionSettings, 
    updateSettings as updateExtensionSettings, 
    ExtensionSettings 
} from '../service/ExtensionSettings'
import { 
    MessageRequest, MessageResponse, MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS 
} from "../types/Message";

const SETTINGS_STORAGE_KEY = 'settings'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser;

/**
 * This file contains handlers for processing messages that relate to manging this Extensions
 * settings.
 */

const logger = new BrowserExtensionLogger(LogLevel.DEBUG);

export async function getSettings(): Promise<MessageResponse> {
    return _browser.storage.local.get([SETTINGS_STORAGE_KEY]).then((settings: ExtensionSettings) => {
        logger.logMessage('Read Extension Settings from Local Storage', LogLevel.DEBUG, settings)
        return {
            "status": MESSAGE_RESPONSE_STATUS.SUCCESS,
            "data": settings
        }
    }).catch((err) => {
        return {
            "status": MESSAGE_RESPONSE_STATUS.UNKNOWN_ERROR
        }
    })
}

export async function updateSettings(request: MessageRequest): Promise<MessageResponse> {
    if (request.params) {
        return _browser.storage.local.set({[SETTINGS_STORAGE_KEY]: request.params}).then(() => {
            logger.logMessage('Set Extension Settings in Local Storage', LogLevel.DEBUG)
            return getSettings()
        })
    } else {
        logger.logMessage('Unable to store Extension Settings', LogLevel.ERROR, request)
        throw new ExtensionError('Unable to process updateSetting request')
    }
}