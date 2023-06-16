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
    ResponseError,
    EvaluationApi,
    ApiComponentDTOV2,
    ApiComponentEvaluationResultDTOV2
} from '@sonatype/nexus-iq-api-client'
import { logger, LogLevel } from '../logger/Logger'
import { readExtensionConfiguration } from '../messages/SettingsMessages'
import { ExtensionConfiguration } from '../types/ExtensionConfiguration'
import { InvalidConfigurationError } from '../error/ExtensionError'
import { 
    MessageRequest, MessageResponse, MESSAGE_RESPONSE_STATUS 
} from "../types/Message"
import { DATA_SOURCE } from '../utils/Constants'
import { UserAgentHelper } from '../utils/UserAgentHelper'

/**
 * This file contains handlers for processing messages that relate to calling
 * Sonatype IQ Server.
 */

export async function requestComponentEvaluationByPurls(request: MessageRequest): Promise<MessageResponse> {
    return _get_iq_api_configuration().then((apiConfig) => {
        return apiConfig
    }).catch((err) => { 
        throw err
    }).then((apiConfig) => {
        logger.logMessage('API Configiration', LogLevel.INFO, apiConfig)
        const applicationId = '370bf138ffa0429791b7c269cd8edbb9'
        const apiClient = new EvaluationApi(apiConfig)

        // @typescript-eslint/strict-boolean-expressions:
        let purls: Array<string> = []
        if (request.params && 'purls' in request.params) {
            purls = request.params['purls'] as Array<string>
        }

        return apiClient.evaluateComponents({
            applicationId: applicationId,
            apiComponentEvaluationRequestDTOV2: {
                components: purls.map(purl => {
                    return { packageUrl: purl }
                })
            }
        }).then((evaluateRequestResponse) => {
            logger.logMessage('Response from evaluateComponents', LogLevel.INFO, evaluateRequestResponse)
            return {
                "status": MESSAGE_RESPONSE_STATUS.SUCCESS,
                "data": evaluateRequestResponse
            }
        }).catch(_handle_iq_error_repsonse)
    })
}

// export const untilAsync = async (fn, time = 1000, wait = 10000) => {
//     const startTime = new Date().getTime();  /* [1] */
//     for (;;) {                               /* [2] */
//       try {
//         if (await fn()) {                    /* [3] */
//           return true;
//         }
//       } catch (e) {                          /* [4] */
//         throw e;
//       }
  
//       if (new Date().getTime() - startTime > wait) {
//         throw new Error('Max wait reached'); /* [5] */
//       } else {                               /* [6] */
//         await new Promise((resolve) => setTimeout(resolve, time));
//       }
//     }
//   };

// export function pollForComponentEvaluationResult2(applicationId: string, resultId: string): ApiComponentEvaluationResultDTOV2 {
//     _get_iq_api_configuration().catch((err) => { 
//         throw err
//     }).then((apiConfig) => {
//         const apiClient = new EvaluationApi(apiConfig)
//         apiClient.getComponentEvaluation({
//             applicationId: applicationId,
//             resultId: resultId
//         }).catch((err) => {

//         })
//     })
//     try {
//         const apiConfig = await _get_iq_api_configuration();
//         const apiClient = new EvaluationApi(apiConfig)
//         const result = await apiClient.getComponentEvaluation({
//             applicationId: applicationId,
//             resultId: resultId
//         })

//         if (polling && result.results) {                      
//             polling = false
//             resolve(result)
//         } else {                                              
//             setTimeout(executePoll, time)
//         }
//     } catch (error) {      
//         if (error instanceof ResponseError && error.response.status == 404) {
//             // Continue polling
//             logger.logMessage(`ResultId ${resultId} not ready (404). Continuing to poll...`, LogLevel.INFO)
//         } else {
//             polling = false
//             reject(new Error("Polling cancelled due to API error"))
//         }
//     }
// }

export function pollForComponentEvaluationResult(applicationId: string, resultId: string, time: number) {
    let polling = false                            
    let rejectThis = null
  
    const stopPolling = () => {                                 
        if (polling) {
            console.log(new Date(), "Polling was already stopped...")
        } else {
            console.log(new Date(), "Stopping polling...")       
            polling = false
            rejectThis(new Error("Polling cancelled"))
        }
    };
  
    const promise = new Promise((resolve, reject) => {          
        polling = true                                 
        rejectThis = reject                                 
    
        const executePoll = async () => {                         
            try {
                const apiConfig = await _get_iq_api_configuration();
                const apiClient = new EvaluationApi(apiConfig)
                const result = await apiClient.getComponentEvaluation({
                    applicationId: applicationId,
                    resultId: resultId
                })

                if (polling && result.results) {                      
                    polling = false
                    resolve(result)
                } else {                                              
                    setTimeout(executePoll, time)
                }
            } catch (error) {      
                if (error instanceof ResponseError && error.response.status == 404) {
                    // Continue polling
                    logger.logMessage(`ResultId ${resultId} not ready (404). Continuing to poll...`, LogLevel.INFO)
                    setTimeout(executePoll, time)
                } else {
                    polling = false
                    reject(new Error("Polling cancelled due to API error"))
                }
            }
        };
  
      setTimeout(executePoll, time)                       
    })
  
    return { promise, stopPolling }                        
}

export async function getApplications(request: MessageRequest): Promise<MessageResponse> { 
    return _get_iq_api_configuration().then((apiConfig) => {
        return apiConfig
    }).catch((err) => { 
        throw err
    }).then((apiConfig) => {
        logger.logMessage('API Configiration', LogLevel.INFO, apiConfig)
        const apiClient = new ApplicationsApi(apiConfig)

        return apiClient.getApplications({}).then((applications) => {
            return {
                "status": MESSAGE_RESPONSE_STATUS.SUCCESS,
                "data": applications
            }
        }).catch(_handle_iq_error_repsonse)
    })
}

async function _get_iq_api_configuration(): Promise<Configuration> {
    return readExtensionConfiguration().then((response) => {
        if (chrome.runtime.lastError) {
            console.log('Error _get_iq_api_configuration', chrome.runtime.lastError.message)
        }
        if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
            const settings = response.data as ExtensionConfiguration
            if (settings.dataSource !== DATA_SOURCE.NEXUSIQ) {
                logger.logMessage(`Attempt to get connection configuration for ${DATA_SOURCE.NEXUSIQ}, but DATA_SOURCE is ${settings.dataSource}`, LogLevel.ERROR, settings)
                throw new InvalidConfigurationError('Attempt to get connection configuration for Sonatype IQ Server, but DATA_SOURCE is not NEXUSIQ')
            }

            if (settings.host === undefined) {
                logger.logMessage(`Host is not set for IQ Server`, LogLevel.WARN)
                throw new InvalidConfigurationError('Host is not set for IQ Server')
            }

            return new Configuration({
                basePath: (settings.host.endsWith('/') ? settings.host.slice(0, -1) : settings.host),
                username: settings.user,
                password: settings.token,
                headers: {
                    'User-Agent': UserAgentHelper.getUserAgent(),
                    'X-User-Agent': UserAgentHelper.getUserAgent()
                }
            })
        } else {
            throw new InvalidConfigurationError('Unable to get Extension Configuration')
        }
    }).catch((err) => {
        throw err
    })
}

function _handle_iq_error_repsonse(err) {
    if (err instanceof ResponseError) {
        if (err.response.status > 400 && err.response.status < 404) {
            return {
                "status": MESSAGE_RESPONSE_STATUS.AUTH_ERROR
            }
        } else {
            return {
                "status": MESSAGE_RESPONSE_STATUS.FAILURE,
                "status_detail": {
                    "message": "Failed to call Sonatype IQ Server",
                    "detail": `${err.response.status}: ${err.message}`
                }
            }
        }
    }
    return {
        "status": MESSAGE_RESPONSE_STATUS.FAILURE,
        "status_detail": {
            "message": "Failed to call Sonatype IQ Server",
            "detail": err
        }
    }
}