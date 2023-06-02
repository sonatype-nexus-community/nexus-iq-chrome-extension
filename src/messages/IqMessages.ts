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
    Configuration,
    ApplicationsApi,
    DefaultConfig
} from '@sonatype/nexus-iq-api-client'
import { BrowserExtensionLogger, LogLevel } from '../logger/Logger';
import { getSettings, ExtensionSettings } from '../service/ExtensionSettings'
import { 
    MessageRequest, MessageResponse, MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS 
} from "../types/Message";
import { DATA_SOURCE } from '../utils/Constants';

const logger = new BrowserExtensionLogger(LogLevel.ERROR);

/**
 * This file contains handlers for processing messages that relate to calling
 * Sonatype IQ Server.
 */

function getApplications(request: MessageRequest): MessageResponse {
    const response: MessageResponse = {
        "status": MESSAGE_RESPONSE_STATUS.UNKNOWN_ERROR
    }

    try {
        const apiConfig = _get_iq_api_configuration()
    } catch (err) {
        if (err instanceof InvalidConfigurationError) {
            response.status = MESSAGE_RESPONSE_STATUS.FAILURE
            response.status_detail = {
                "message": "Invalid Extension Configuration - see Error Log"
            }
        }
    }

    return response
}

function _get_iq_api_configuration(): Configuration {
    const 
    getSettings().then((settings: ExtensionSettings) => {
        if (settings.dataSource !== DATA_SOURCE.NEXUSIQ) {
            logger.logMessage('Attempt to get connetion configuration for Sonatype IQ Server, but DATA_SOURCE is not NEXUSIQ', LogLevel.ERROR)
            throw new InvalidConfigurationError('Attempt to get connetion configuration for Sonatype IQ Server, but DATA_SOURCE is not NEXUSIQ')
        }

        return new Configuration({
            basePath: settings.host,
        })
        

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        // if (!settings.host || !settings.application || !settings.scanType || !settings.user || !settings.token ) {
        //     console.error('Unable to get settings need to make IQ connection: ', settings);
        // }
        // if (settings.logLevel) {
        // logger.setLevel(settings.logLevel as unknown as LogLevel);
        // }
        // try {
        // if ((settings.scanType as unknown as string) === 'NEXUSIQ') {
        //     logger.logMessage('Attempting to call Nexus IQ Server', LogLevel.INFO);
        //     handleIQServerWrapper(request.purl, settings);
        // } else {
        //     logger.logMessage('Attempting to call OSS Index', LogLevel.INFO);
        //     handleOSSIndexWrapper(request.purl, settings);
        // }
        // } catch (err) {
        // logger.logMessage('Error encountered', LogLevel.ERROR, err.message);
        // console.error('Error encountered in getArtifactDetailsFromPurl', err.message);

        // }
    })
        
    return config
}