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

import { BrowserExtensionLogger, LogLevel } from '../logger/Logger';
import { 
    getSettings as getExtensionSettings, 
    updateSettings as updateExtensionSettings, 
    ExtensionSettings 
} from '../service/ExtensionSettings'
import { 
    MessageRequest, MessageResponse, MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS 
} from "../types/Message";

/**
 * This file contains handlers for processing messages that relate to manging this Extensions
 * settings.
 */

export function getSettings(request: MessageRequest): MessageResponse {
    const response: MessageResponse = {
        "status": MESSAGE_RESPONSE_STATUS.UNKNOWN_ERROR
    }

    getExtensionSettings().then((settings: ExtensionSettings) => {
        response.status = MESSAGE_RESPONSE_STATUS.SUCCESS
        response.data = settings
    })

    return response
}

export function updateSettings(request: MessageRequest): MessageResponse {
    const response: MessageResponse = {
        "status": MESSAGE_RESPONSE_STATUS.UNKNOWN_ERROR
    }

    if (request.params) {
        updateExtensionSettings(request.params as ExtensionSettings).then((settings) => {
            response.status = MESSAGE_RESPONSE_STATUS.SUCCESS
            response.data = settings
        })
    }

    return response
}