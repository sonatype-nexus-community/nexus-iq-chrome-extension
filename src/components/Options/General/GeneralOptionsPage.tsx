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

import { NxFormGroup, NxFormSelect } from '@sonatype/react-shared-components'
import React, { useContext } from 'react'
import { ExtensionConfiguration } from '../../../types/ExtensionConfiguration'
import { ExtensionConfigurationContext } from '../../../context/ExtensionConfigurationContext'
import { LogLevel } from '../../../logger/Logger'

export default function GeneralOptionsPage({
    setExtensionConfig,
}: {
    setExtensionConfig: (settings: ExtensionConfiguration) => void
}) {
    const extensionSettings = useContext(ExtensionConfigurationContext)

    function handleLogLevelChange(e) {
        const newExtensionSettings = extensionSettings as ExtensionConfiguration
        newExtensionSettings.logLevel = e.target.value as number
        setExtensionConfig(newExtensionSettings)
    }

    return (
        <form className='nx-form'>
            <NxFormGroup label={`Extension Log Level`} isRequired>
                <NxFormSelect defaultValue={extensionSettings.logLevel} onChange={handleLogLevelChange}>
                    {Object.keys(LogLevel)
                        .filter((key) => !isNaN(Number(LogLevel[key])))
                        .map((val, key) => {
                            return (
                                <option key={key} value={key}>
                                    {LogLevel[key]}
                                </option>
                            )
                        })}
                </NxFormSelect>
            </NxFormGroup>
        </form>
    )
}
