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

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser

function ensure<T>(argument: T | undefined | null, message = 'This value was promised to be there.'): T {
    if (argument === undefined || argument === null) {
        throw new TypeError(message)
    }

    return argument
}

function stripHtmlComments(html: string): string {
    return html.replace(/<!--[\s\S]*?(?:-->)/g, '')
}

function stripTrailingSlash(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url
}

function getNewUrlandGo(currentTab, currentPurlVersion: string, version: string) {
    const currentTabUrl = currentTab.url
    // const currentPurlVersion = popupContext.currentPurl?.version

    logger.logMessage(`Remediation Details: Replacing URL with ${version}`, LogLevel.DEBUG)
    if (currentPurlVersion !== undefined && currentTabUrl !== undefined) {
        const currentVersion = new RegExp(currentPurlVersion as string)
        const newUrl = currentTabUrl?.toString().replace(currentVersion, version)
        logger.logMessage(`Remediation Details: Generated new URL ${newUrl}`, LogLevel.DEBUG)
        _browser.tabs.update({
            url: newUrl,
        })
        window.close()
    } else {
        logger.logMessage(
            `Remediation Details: currentTabURL or currentPul are undefined when trying to replace with ${version}`,
            LogLevel.ERROR
        )
    }
}

export { ensure, stripHtmlComments, getNewUrlandGo, stripTrailingSlash }
