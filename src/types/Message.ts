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

/**
 * Enumeration of Message Types that are known.
 */
export enum MESSAGE_REQUEST_TYPE {
    GET_APPLICATIONS = 'getApplications',
    GET_SETTINGS = 'readExtensionConfiguration',
    UPDATE_SETTINGS = 'updateExtensionConfiguration'
}

/**
 * Enumeration of statuses that can be returned in response to Message Request.
 */
export enum MESSAGE_RESPONSE_STATUS {
    SUCCESS,
    AUTH_ERROR,
    FAILURE,
    UNKNOWN_ERROR
}

/**
 * All Message Requests must conform to this structure.
 */
export interface MessageRequest {
    type: MESSAGE_REQUEST_TYPE,
    params?: object
}

/**
 * All Message Responses must conform to this structure.
 */
export interface MessageResponse {
    status: MESSAGE_RESPONSE_STATUS,
    status_detail?: object,
    data?: object
}

export type MessageHandlerFunction = {
    (request: MessageRequest): MessageResponse
}

export type MessageResponseFunction = {
    (response: MessageResponse): void
}