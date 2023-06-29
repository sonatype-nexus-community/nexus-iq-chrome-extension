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

import { Configuration, ComponentVulnerabilityReportsApi, ResponseError } from '@sonatype/ossindex-api-client'
import { logger, LogLevel } from '../logger/Logger'
import { readExtensionConfiguration } from './SettingsMessages'
import { ExtensionConfiguration } from '../types/ExtensionConfiguration'
import { InvalidConfigurationError } from '../error/ExtensionError'
import { MESSAGE_RESPONSE_STATUS, MessageRequest, MessageResponse } from '../types/Message'
import { DATA_SOURCE } from '../utils/Constants'
import { UserAgentHelper } from '../utils/UserAgentHelper'

const OSS_INDEX_HOST = 'https://ossindex.sonatype.org'

/**
 * This file contains handlers for processing messages that relate to calling
 * Sonatype OSS Index.
 */

export async function getComponentDetails(request: MessageRequest): Promise<MessageResponse> {
    return _get_ossindex_api_configuration()
        .then((apiConfig) => {
            return apiConfig
        })
        .catch((err) => {
            throw err
        })
        .then((apiConfig) => {
            logger.logMessage(
                'Making API Call ComponentVulnerabilityReportsApi::authorizedComponentReport()',
                LogLevel.DEBUG,
                apiConfig
            )
            const apiClient = new ComponentVulnerabilityReportsApi(apiConfig)

            // @typescript-eslint/strict-boolean-expressions:
            let purls: Array<string> = []
            if (request.params && 'purls' in request.params) {
                purls = request.params['purls'] as Array<string>
            }

            return apiClient
                .authorizedComponentReport({
                    body: {
                        coordinates: purls,
                    },
                })
                .then((componentVulnerabilityResponse) => {
                    logger.logMessage(
                        'componentVulnerabilityResponse response',
                        LogLevel.DEBUG,
                        componentVulnerabilityResponse
                    )
                    return {
                        status: MESSAGE_RESPONSE_STATUS.SUCCESS,
                        data: componentVulnerabilityResponse,
                    }
                })
                .catch(_handle_ossindex_error_repsonse)
        })
}

function _get_ossindex_api_configuration(): Promise<Configuration> {
    return readExtensionConfiguration()
        .then((response) => {
            if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
                const settings = response.data as ExtensionConfiguration
                if (settings.dataSource !== DATA_SOURCE.OSSINDEX) {
                    logger.logMessage(
                        `Attempt to get connection configuration for ${DATA_SOURCE.OSSINDEX}, but DATA_SOURCE is ${settings.dataSource}`,
                        LogLevel.ERROR,
                        settings
                    )
                    throw new InvalidConfigurationError(
                        'Attempt to get connection configuration for Sonatype IQ Server, but DATA_SOURCE is not NEXUSIQ'
                    )
                }

                return new Configuration({
                    basePath: OSS_INDEX_HOST,
                    username: settings.user,
                    password: settings.token,
                    headers: {
                        'User-Agent': UserAgentHelper.getUserAgent(),
                        'X-User-Agent': UserAgentHelper.getUserAgent(),
                    },
                })
            } else {
                throw new InvalidConfigurationError('Unable to get Extension Configuration')
            }
        })
        .catch((err) => {
            throw err
        })
}

function _handle_ossindex_error_repsonse(err) {
    logger.logMessage(`Handling Error Response from OSS Index ${err}`, LogLevel.WARN)
    if (err instanceof ResponseError) {
        logger.logMessage(`   OSS Index Error: ${err.response.status}: ${err.response.statusText}`, LogLevel.WARN)
        if (err.response.status > 400 && err.response.status < 404) {
            return {
                status: MESSAGE_RESPONSE_STATUS.AUTH_ERROR,
            }
        } else {
            return {
                status: MESSAGE_RESPONSE_STATUS.FAILURE,
                status_detail: {
                    message: 'Failed to call Sonatype OSS Index',
                    detail: `${err.response.status}: ${err.message}`,
                },
            }
        }
    }
    return {
        status: MESSAGE_RESPONSE_STATUS.FAILURE,
        status_detail: {
            message: 'Failed to call Sonatype OSS Index',
            detail: err,
        },
    }
}
