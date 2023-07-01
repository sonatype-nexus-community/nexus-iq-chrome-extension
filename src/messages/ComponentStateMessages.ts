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

import { logger, LogLevel } from '../logger/Logger'
import { ComponentState } from '../types/Component'
import { MESSAGE_REQUEST_TYPE } from '../types/Message'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser

export async function propogateCurrentComponentState(tabId: number, componentState: ComponentState): Promise<void> {
    logger.logMessage(`Propogating Component State ${componentState}`, LogLevel.DEBUG)
    _browser.tabs
        .sendMessage(tabId, {
            type: MESSAGE_REQUEST_TYPE.PROPOGATE_COMPONENT_STATE,
            params: {
                componentState: componentState,
            },
        })
        .catch((err) => {
            logger.logMessage(`Error caught propogating ComponentState to Tab`, LogLevel.DEBUG, err)
        })
        .then(() => {
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (_browser.runtime.lastError) {
                logger.logMessage(`Error propogating ComponentState to Tab`, LogLevel.DEBUG, _browser.runtime.lastError)
            }
        })
}
