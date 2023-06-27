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
    NxFormGroup,
    NxGrid,
    NxStatefulErrorAlert,
    NxStatefulSuccessAlert,
    NxStatefulTextInput,
    NxTooltip,
    NxFontAwesomeIcon,
    NxFormSelect,
    NxButton,
} from '@sonatype/react-shared-components'
import React, { useEffect, useState, useContext } from 'react'
import './IQServerOptionsPage.css'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

import { MESSAGE_REQUEST_TYPE, MESSAGE_RESPONSE_STATUS } from '../../../types/Message'
import { DEFAULT_EXTENSION_SETTINGS, ExtensionConfiguration } from '../../../types/ExtensionConfiguration'
import { ExtensionConfigurationContext } from '../../../context/ExtensionConfigurationContext'
import { isHttpUriValidator, nonEmptyValidator } from '../../Common/Validators'
import { logger, LogLevel } from '../../../logger/Logger'
import { ApiApplicationDTO } from '@sonatype/nexus-iq-api-client'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser

export interface IqServerOptionsPageInterface {
    setExtensionConfig: (settings: ExtensionConfiguration) => void
}

export default function IQServerOptionsPage(props: IqServerOptionsPageInterface) {
    const extensionSettings = useContext(ExtensionConfigurationContext)
    const [hasPermissions, setHasPermission] = useState(false)
    const [iqAuthenticated, setIqAuthenticated] = useState<boolean | undefined>()
    const [iqServerApplicationList, setiqServerApplicationList] = useState([])
    const setExtensionConfig = props.setExtensionConfig

    /**
     * Hook to check whether we already have permissions to IQ Server Host
     */
    useEffect(() => {
        if (extensionSettings.host !== undefined) {
            hasOriginPermission()
        }
    })

    /**
     * Request permission to IQ Server Host
     */
    const askForPermissions = () => {
        logger.logMessage(`Requesting Browser Permission to Origin: '${extensionSettings?.host}'`, LogLevel.INFO)

        if (extensionSettings.host !== undefined) {
            logger.logMessage(`Requesting permission to Origin ${extensionSettings.host}`, LogLevel.DEBUG)
            _browser.permissions.request(
                {
                    origins: [extensionSettings.host],
                },
                (granted) => {
                    console.log('Response from Permission Request', granted)
                    setHasPermission(granted as boolean)
                }
            )
        }
    }

    function hasOriginPermission() {
        if (extensionSettings.host !== undefined && isHttpUriValidator(extensionSettings.host)) {
            chrome.permissions.contains(
                {
                    origins: [extensionSettings.host],
                },
                (result) => {
                    if (chrome.runtime.lastError) {
                        console.log('Error in hasOriginPermission', chrome.runtime.lastError.message)
                    }
                    if (result) {
                        setHasPermission(true)
                    } else {
                        setHasPermission(false)
                    }
                }
            )
        }
    }

    /**
     * Field onChange Handlers
     */
    function handleIqHostChange(e) {
        const newExtensionSettings = extensionSettings !== undefined ? extensionSettings : DEFAULT_EXTENSION_SETTINGS
        newExtensionSettings.host = (e as string).endsWith('/') ? e : `${e}/`
        setExtensionConfig(newExtensionSettings)
        hasOriginPermission()
    }

    function handleIqTokenChange(e) {
        const newExtensionSettings = extensionSettings as ExtensionConfiguration
        newExtensionSettings.token = e as string
        setExtensionConfig(newExtensionSettings)
    }

    function handleIqUserChange(e) {
        const newExtensionSettings = extensionSettings as ExtensionConfiguration
        newExtensionSettings.user = e as string
        setExtensionConfig(newExtensionSettings)
    }

    function handleIqApplicationChange(e) {
        const newExtensionSettings = extensionSettings as ExtensionConfiguration
        const [iqApplicationInternalId, iqApplicationPublidId] = (e.target.value as string).split('|')
        newExtensionSettings.iqApplicationInternalId = iqApplicationInternalId
        newExtensionSettings.iqApplicationPublidId = iqApplicationPublidId
        setExtensionConfig(newExtensionSettings)
    }

    function handleLoginCheck() {
        _browser.runtime.sendMessage(
            {
                type: MESSAGE_REQUEST_TYPE.GET_APPLICATIONS,
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    logger.logMessage('Error handleLoginCheck', LogLevel.ERROR)
                }
                if (response.status == MESSAGE_RESPONSE_STATUS.SUCCESS) {
                    setIqAuthenticated(true)
                    setiqServerApplicationList(response.data.applications)
                } else {
                    setIqAuthenticated(false)
                    setiqServerApplicationList([])
                }
            }
        )
    }

    return (
        <React.Fragment>
            <NxGrid.Row>
                <section className='nx-grid-col nx-grid-col--100'>
                    <p className='nx-p'>
                        <strong>1)</strong> Enter the URL for the Sonatype IQ Server and grant the permissions needed
                        for the extension to communicate with the Sonatype IQ Server.
                    </p>

                    <div className='nx-form-row'>
                        <NxFormGroup label={`URL`} isRequired>
                            <NxStatefulTextInput
                                defaultValue={extensionSettings.host}
                                placeholder='https://your-iq-server-url'
                                validator={nonEmptyValidator}
                                onChange={handleIqHostChange}
                            />
                        </NxFormGroup>
                        {!hasPermissions && (
                            <button className='nx-btn grant-permissions' onClick={askForPermissions}>
                                Grant Permissions to your Sonatype IQ Server
                            </button>
                        )}
                    </div>

                    {hasPermissions && (
                        <div>
                            <p className='nx-p'>
                                <strong>2)</strong> Provide your username and token for the Sonatype IQ Server. Then
                                connect to retrieve the list of applications available.
                            </p>
                            <div className='nx-form-row'>
                                <NxFormGroup label={`Username`} isRequired>
                                    <NxStatefulTextInput
                                        defaultValue={extensionSettings?.user}
                                        validator={nonEmptyValidator}
                                        onChange={handleIqUserChange}
                                    />
                                </NxFormGroup>
                                <NxFormGroup label={`Token`} isRequired>
                                    <NxStatefulTextInput
                                        defaultValue={extensionSettings?.token}
                                        validator={nonEmptyValidator}
                                        type='password'
                                        onChange={handleIqTokenChange}
                                    />
                                </NxFormGroup>
                                <NxButton variant='primary' onClick={handleLoginCheck}>
                                    Connect
                                </NxButton>
                            </div>
                        </div>
                    )}
                    {iqAuthenticated === true && iqServerApplicationList.length > 0 && (
                        <React.Fragment>
                            <p className='nx-p'>
                                <strong>3)</strong> Choose the Sonatype Lifecycle Application.
                                <NxTooltip title='The application policies that components will be evaluated against.'>
                                    <NxFontAwesomeIcon icon={faQuestionCircle as IconDefinition} />
                                </NxTooltip>
                            </p>

                            <NxFormGroup label={`Sonatype Lifecycle Application`} isRequired>
                                <NxFormSelect
                                    defaultValue={`${extensionSettings.iqApplicationInternalId}|${extensionSettings.iqApplicationPublidId}`}
                                    onChange={handleIqApplicationChange}
                                    disabled={!iqAuthenticated}>
                                    {iqServerApplicationList.map((app: ApiApplicationDTO) => {
                                        return (
                                            <option key={app.id} value={`${app.id}|${app.publicId}`}>
                                                {app.name}
                                            </option>
                                        )
                                    })}
                                </NxFormSelect>
                            </NxFormGroup>
                        </React.Fragment>
                    )}

                    {iqAuthenticated === true && (
                        <NxStatefulSuccessAlert>
                            Congrats! You are able to sign in to your Sonatype IQ Server! If you need to choose an
                            application, do so now.
                        </NxStatefulSuccessAlert>
                    )}
                    {iqAuthenticated === false && (
                        <NxStatefulErrorAlert>There was an error signing in, it looks like</NxStatefulErrorAlert>
                    )}
                </section>
            </NxGrid.Row>
        </React.Fragment>
    )
}
