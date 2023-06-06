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

import { InvalidConfigurationError } from '../error/ExtensionError'
import { 
    MessageRequest, MessageResponse, MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS 
} from "../types/Message";
import { DATA_SOURCES } from '../utils/Constants';
import { UserAgentHelper } from '../utils/UserAgentHelper';

const logger = new BrowserExtensionLogger(LogLevel.ERROR);

/**
 * This file contains handlers for processing messages that relate to calling
 * Sonatype IQ Server.
 */

export function getApplications(request: MessageRequest): MessageResponse {
    const response: MessageResponse = {
        "status": MESSAGE_RESPONSE_STATUS.UNKNOWN_ERROR
    }

     _get_iq_api_configuration().then((apiConfig) => {
        return new ApplicationsApi(apiConfig)
    }).then((apiClient) => {
        apiClient.getApplicationsRaw({}).then((apiResponse) => {
            switch(apiResponse.raw.status) {
                case 200:
                case 204:
                    response.status = MESSAGE_RESPONSE_STATUS.SUCCESS
                    response.data = apiResponse.value
                    break
    
                case 401:
                case 403:
                    response.status = MESSAGE_RESPONSE_STATUS.AUTH_ERROR
                    response.status_detail = {
                        message: apiResponse.raw.statusText
                    }
                    break
    
                default:
                    response.status = MESSAGE_RESPONSE_STATUS.UNKNOWN_ERROR
                    response.status_detail = {
                        message: `${apiResponse.raw.status}: ${apiResponse.raw.statusText}`
                    }
                    break
            }
            return response
        }).catch((err) => {
            if (err instanceof InvalidConfigurationError) {
                response.status = MESSAGE_RESPONSE_STATUS.FAILURE
                response.status_detail = {
                    "message": "Invalid Extension Configuration - see Error Log"
                }
            } else {
                response.status = MESSAGE_RESPONSE_STATUS.FAILURE
                response.status_detail = {
                    "message": "Unknown Error - see Error Log"
                }
            }
        })
    })
    console.log("getApplications returning response", response)
    return response
}

function _get_iq_api_configuration(): Promise<Configuration> {
    return getSettings().then(async (settings: ExtensionSettings) => {
        console.log('Got settings in _get_iq_api_configuration', settings)
        // if (settings.dataSource !== DATA_SOURCES.NEXUSIQ) {
        //     logger.logMessage('Attempt to get connection configuration for Sonatype IQ Server, but DATA_SOURCE is not NEXUSIQ', LogLevel.ERROR, settings)
        //     throw new InvalidConfigurationError('Attempt to get connection configuration for Sonatype IQ Server, but DATA_SOURCE is not NEXUSIQ')
        // }

        return new Configuration({
            basePath: settings.host,
            username: settings.user,
            password: settings.token,
            headers: {
                'User-Agent': await UserAgentHelper.getUserAgent(true, 'nexus-iq-chrome-extension', '2.0.0')
            }
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
    }).catch((err) => {
        throw err
    })
}