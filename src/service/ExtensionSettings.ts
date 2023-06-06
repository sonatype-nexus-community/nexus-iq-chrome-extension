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

import { logger, LogLevel } from "../logger/Logger"
import { DATA_SOURCES } from "../utils/Constants";

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser;

const SETTINGS_STORAGE_KEY = 'settings'

const SCAN_TYPE = 'scanType';
const IQ_SERVER_URL = 'iqServerURL';
const IQ_SERVER_APPLICATION = 'iqServerApplication';
const IQ_SERVER_USER = 'iqServerUser';
const IQ_SERVER_TOKEN = 'iqServerToken';
const LOG_LEVEL = 'logLevel';

export interface ExtensionSettings {
    dataSource: string;
    host?: string;
    user?: string;
    token?: string;
    iqApplicationId?: string;
    logLevel: string;
}

export async function   getSettings(): Promise<ExtensionSettings> {
    logger.logMessage('getSettings loading from local storage', LogLevel.TRACE)

    const promise = new Promise<ExtensionSettings>((resolve) => {
        _browser.storage.local.get([SETTINGS_STORAGE_KEY]).then((settings: ExtensionSettings) => {
            logger.logMessage('Got Settings', LogLevel.INFO, settings)
            console.log('Got settings', settings)
            resolve(settings)
        })

        // _browser.storage.local.get(
        //     [SCAN_TYPE, IQ_SERVER_URL, IQ_SERVER_USER, IQ_SERVER_TOKEN, IQ_SERVER_APPLICATION, LOG_LEVEL],
        //     (items: {[key: string]: string}) => {
        //         resolve({
        //             dataSource: DATA_SOURCE[items[SCAN_TYPE]],
        //             host: items[IQ_SERVER_URL],
        //             user: items[IQ_SERVER_USER],
        //             token: items[IQ_SERVER_TOKEN],
        //             iqApplicationId: items[IQ_SERVER_APPLICATION],
        //             logLevel: items[LOG_LEVEL]
        //         });
        //     }
        // );
    });

    return await promise
}

export async function updateSettings(settings: ExtensionSettings): Promise<ExtensionSettings> {
    logger.logMessage('updateSettings to local storage', LogLevel.TRACE)

    const promise = new Promise<ExtensionSettings>(() => {
        _browser.storage.local.set({
            [SETTINGS_STORAGE_KEY]: settings
        }, () => {
            // if (_browser.runtime.lastError instanceof chrome.runtime.LastError) {
            //     logger.logMessage('Error in updateSettings', LogLevel.ERROR, _browser.runtime.lastError)
            // }

            return getSettings()
        })
        // _browser.storage.local.get(
        //     [SCAN_TYPE, IQ_SERVER_URL, IQ_SERVER_USER, IQ_SERVER_TOKEN, IQ_SERVER_APPLICATION, LOG_LEVEL],
        //     (items: {[key: string]: string}) => {
        //         resolve({
        //             dataSource: DATA_SOURCE[items[SCAN_TYPE]],
        //             host: items[IQ_SERVER_URL],
        //             user: items[IQ_SERVER_USER],
        //             token: items[IQ_SERVER_TOKEN],
        //             iqApplicationId: items[IQ_SERVER_APPLICATION],
        //             logLevel: items[LOG_LEVEL]
        //         });
        //     }
        // );
    });

    return await promise
}