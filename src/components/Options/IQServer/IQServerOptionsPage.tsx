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
import { ExtensionConfigurationContext } from '../../../context/NexusContext'
import { isHttpUriValidator, nonEmptyValidator } from '../../Common/Validators'
import { logger, LogLevel } from '../../../logger/Logger'
import { ApiApplicationDTO } from '@sonatype/nexus-iq-api-client'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any
const _browser: any = chrome ? chrome : browser

const IQ_SERVER_URL = 'iqServerURL'
const IQ_SERVER_USER = 'iqServerUser'
const IQ_SERVER_TOKEN = 'iqServerToken'
const IQ_SERVER_APPLICATION = 'iqServerApplication'
const SCAN_TYPE = 'scanType'

// const IQServerOptionsPage = (): JSX.Element | null => {

//   const [iqServerURL, setIQServerURL] = useState('');
//   const [iqServerUser, setIQServerUser] = useState('');
//   const [iqServerToken, setIQServerToken] = useState('');
//   const [iqServerApplication, setIQServerApplication] = useState('');
//   const [iqServerApplications, setIQServerApplications] = useState([]);
//   const [currentScanType, setCurrentScanType] = useState(DATA_SOURCE.NEXUSIQ);
//   const [loading, setLoading] = useState(true);
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [hasPermissions, setPermissions] = useState(false);
//   const [errorLoggingIn, setErrorLoggingIn] = useState('');

//   // const [iqConfiguration, setIqConfiguration] = useState({
//   //   dataSource: DATA_SOURCE.NEXUSIQ,
//   // })

//   const isSubmittable =
//     iqServerURL !== '' && iqServerUser !== '' && iqServerToken !== '';
//   // iqServerURL !== '' && iqServerUser !== '' && iqServerToken !== '' && iqServerApplication !== '';

//   // const submitBtnClasses = classnames({disabled: !isSubmittable});
//   // submitTooltip = isSubmittable ? '' : 'Required fields are missing';

//   const nonEmptyValidator = (val: string) => (val && val.length ? null : 'Must be non-empty');

//   // const checkPermissions = (): boolean => {
//   //   console.info('Checking chrome extension permissions.  Current iqServerUrl: ', iqServerURL.endsWith('/') ? iqServerURL : `${iqServerURL}/`);
//   //   const originsUrl = iqServerURL.endsWith('/') ? `${iqServerURL}*` : `${iqServerURL}/*`
//   //   console.info('Checking chrome extension permissions.  originsUrl: ', originsUrl);
//   //   chrome.permissions.contains({
//   //     origins: [originsUrl]
//   //   }, (result) => {
//   //     if (result) {
//   //       console.info('Chrome extension permissions are set for: ', originsUrl);
//   //       setPermissions(true);
//   //       return true;
//   //     }
//   //     setPermissions(false);
//   //     return false;
//   //   });
//   //   return false;
//   // };

//   // const getSettings = () => {
//   //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   //   chrome.storage.local.get((items: {[key: string]: any}) => {
//   //     if (items[IQ_SERVER_URL] !== undefined) {
//   //       setIQServerURL(items[IQ_SERVER_URL]);
//   //     }
//   //     if (items[IQ_SERVER_USER] !== undefined) {
//   //       setIQServerUser(items[IQ_SERVER_USER]);
//   //     }
//   //     if (items[IQ_SERVER_TOKEN] !== undefined) {
//   //       setIQServerToken(items[IQ_SERVER_TOKEN]);
//   //     }
//   //     if (items[IQ_SERVER_APPLICATION] !== undefined) {
//   //       setIQServerApplication(items[IQ_SERVER_APPLICATION]);
//   //     }
//   //     if (items[SCAN_TYPE] !== undefined) {
//   //       setCurrentScanType(items[SCAN_TYPE]);
//   //     }
//   //     setLoading(false);

//   //   });
//   // }

//   const firstTimeLoadSettings = () => {
//     getSettings().then((settings) => {
//       if (settings.status == MESSAGE_RESPONSE_STATUS.SUCCESS && settings.data) {
//         console.log('Got Extension Settings in Options Page: ', settings)
//         // setIQServerURL(settings.data)
//       }
//     })
//   }

//   useEffect(() => {
//     firstTimeLoadSettings();
//   }, [iqServerApplication, iqServerToken, iqServerURL, iqServerUser, currentScanType]);

//   // useEffect(() => {
//   //   console.info("In useEffect that should only be called once");
//   //   // getAllPermissions();
//   //   // const permissions = checkPermissions();
//   //   if (iqServerURL !== '' && iqServerUser !== '' && iqServerToken !== '') {
//   //     console.info("In useEffect and calling getApplications.");
//   //     void getApplications()
//   //   }
//   // },[iqServerURL]);

//   // useEffect(() => {
//   //   const getApplications = async () => {
//   //     getSettings();
//   //     try {
//   //       const requestService = new IqRequestService({
//   //         user: iqServerUser as string,
//   //         token: iqServerToken,
//   //         host: iqServerURL,
//   //         application: 'sandbox-application',
//   //         logger: new TestLogger(LogLevel.ERROR),
//   //         product: 'nexus-chrome-extension',
//   //         version: '1.0.0',
//   //         browser: true
//   //       });

//   //       console.info("getApplications: Using requestService: ", requestService);
//   //       const response: IqApplicationResponse = await requestService.getApplications();

//   //       if (response.applications.length > 0) {
//   //         const opts = [];
//   //         response.applications.map((app) => {
//   //           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   //           // @ts-ignore
//   //           return opts.push({value: app.publicId, label: app.name});
//   //         });
//   //         setIQServerApplications(opts)
//   //         console.info("Select options: ", opts);
//   //       }
//   //     } catch (err) {
//   //       console.info("getApplication in catch");
//   //       if (err instanceof Error) {
//   //         throw new Error(err.message);
//   //       }
//   //       throw new Error("Unknown error in getApplications");
//   //     }
//   //   };
//   //   if (loggedIn) {
//   //     void getApplications();
//   //   }
//   // },[loggedIn]);

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const setItem = (setter: any, value: string, key: string) => {
//     console.info('setItem: ', key, value);

//     _browser.runtime.sendMessage({
//       type: MESSAGE_REQUEST_TYPE.UPDATE_SETTINGS,
//       params: {
//         dataSource: DATA_SOURCE.NEXUSIQ,
//         host: iqServerURL,
//         user: iqServerUser,
//         token: iqServerToken,
//         iqApplicationId: iqServerApplication
//       }
//     })

//     // setter(value);
//     // chrome.storage.local.set({[key]: value}, () => {
//     //   if (chrome.runtime.lastError) {
//     //     console.error(chrome.runtime.lastError.message);
//     //   }
//     // });
//   };

//   const onSubmit = (): void => {
//     console.info("In onSubmit...");
//     const response = _browser.runtime.sendMessage({
//       type: MESSAGE_REQUEST_TYPE.GET_APPLICATIONS
//     })
//     console.info("RESPONSE: ", response)
//     void doSubmit();
//   };

//   const doSubmit = async () => {
//     console.info("In doSubmit...");
//     if (isSubmittable) {
//       try {
//         const requestService = new IqRequestService({
//           user: iqServerUser as string,
//           token: iqServerToken,
//           host: iqServerURL,
//           application: 'sandbox-application',
//           logger: new TestLogger(LogLevel.ERROR),
//           product: 'nexus-chrome-extension',
//           version: '1.0.0',
//           browser: true
//         });

//         console.info("doSubmit using requestService: ", requestService);
//         const loggedIn = await requestService.loginViaRest();

//         if (loggedIn) {
//           setErrorLoggingIn('');
//           setLoggedIn(loggedIn);
//           console.info("doSubmit loggedIn: ", loggedIn);
//           setItem(setCurrentScanType, DATA_SOURCES.NEXUSIQ, SCAN_TYPE);
//           setItem(setIQServerURL, iqServerURL, IQ_SERVER_URL);
//           setItem(setIQServerUser, iqServerUser, IQ_SERVER_USER);
//           setItem(setIQServerToken, iqServerToken, IQ_SERVER_TOKEN);

//         } else {
//           setErrorLoggingIn('Unable to login');
//           setLoggedIn(false);
//         }
//       } catch (err) {
//         setErrorLoggingIn(err);
//         setLoggedIn(false);
//       }
//     }
//   };

//   const askForPermissions = (event: React.MouseEvent<HTMLButtonElement>) => {
//     console.log(event);

//     console.info('grantOriginsPermissions');

//     chrome.permissions.request(
//       {
//         origins: [iqServerURL.endsWith('/') ? iqServerURL : `${iqServerURL}/`]
//       },
//       (granted) => {
//         if (granted) {
//           console.debug('Granted!!!');
//           setPermissions(true);
//         } else {
//           console.debug('Not granted!!');
//           setPermissions(false);
//         }
//       }
//     );
//   };
//   //
//   // const getAllPermissions = () => {
//   //   console.debug('Getting all chrome extension permissions.');
//   //   chrome.permissions.getAll((result) => {
//   //       console.debug('All chrome permissions: ', result);
//   //   });
//   // };

//   function onChange(evt: FormEvent<HTMLSelectElement>) {
//     console.info("Setting iqServerApplication: ", evt.currentTarget.value);
//     setItem(setIQServerApplication, evt.currentTarget.value, IQ_SERVER_APPLICATION)
//   }

//   const renderOptions = () => {
//     if (!loading) {

//       return (
//         <React.Fragment>
//           <NxGrid.Row>
//             <section className="nx-grid-col nx-grid-col--100">
//                 <p className="nx-p">
//                   <strong>1)</strong> Enter the URL for the Sonatype IQ Server
//                     and grant the permissions needed for the extension to communicate with the Sonatype IQ
//                     Server.
//                   </p>

//                 <div className="nx-form-row">
//                 <NxFormGroup label={`URL`} isRequired>
//                   <NxStatefulTextInput
//                     defaultValue={iqServerURL}
//                     placeholder="https://your-iq-server-url"
//                     validator={nonEmptyValidator}
//                     onChange={(event) => {
//                       setItem(setIQServerURL, event.endsWith('/') ? event.slice(0, -1) : event, IQ_SERVER_URL);
//                     }}
//                   />
//                 </NxFormGroup>
//                   {!hasPermissions && (
//                       // {!checkPermissions() && (
//                       <button className="nx-btn grant-permissions" onClick={askForPermissions}>
//                         Grant Permissions to the Sonatype IQ Server URL
//                       </button>
//                   )}

//                 </div>
//                 <p className="nx-p">
//                   <strong>2)</strong> Provide your username and token for the Sonatype IQ Server.  Then connect to
//                   retrieve the list of applications available.
//                 </p>
//                 <div className="nx-form-row">
//                   <NxFormGroup label={`Username`} isRequired>
//                     <NxStatefulTextInput
//                       defaultValue={iqServerUser}
//                       validator={nonEmptyValidator}
//                       onChange={(event) => setItem(setIQServerUser, event, IQ_SERVER_USER)}
//                     />
//                   </NxFormGroup>
//                   <NxFormGroup label={`Token`} isRequired>
//                     <NxStatefulTextInput
//                       defaultValue={iqServerToken}
//                       validator={nonEmptyValidator}
//                       type="password"
//                       onChange={(event) => setItem(setIQServerToken, event, IQ_SERVER_TOKEN)}
//                     />
//                   </NxFormGroup>
//                   <NxButton
//                       variant="primary"
//                       onClick={onSubmit}>Connect
//                   </NxButton>

//                 </div>

//               { loggedIn && iqServerApplications.length > 0 && (
//                 <React.Fragment>
//                   <p className="nx-p">
//                     <strong>3)</strong> Set the Sonatype Lifecycle Application.
//                     <NxTooltip title="The application policies that components will be evaluated against.">
//                       <NxFontAwesomeIcon
//                           icon={faQuestionCircle as IconDefinition} />
//                     </NxTooltip>

//                   </p>

//                   <NxFormGroup label={`Sonatype Lifecycle Application`} isRequired>
//                     <NxFormSelect value={iqServerApplication} onChange={onChange} disabled={!loggedIn} >
//                       {iqServerApplications.map((app) => {
//                         return (
//                             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//                             // @ts-ignore
//                             <option key={app.value} value={app.value}>{app.label}</option>
//                         )
//                       })}
//                     </NxFormSelect>
//                   </NxFormGroup>
//                 </React.Fragment>
//               )}

//                 {loggedIn && (
//                   <NxStatefulSuccessAlert>
//                     Congrats! You are able to sign in to your Sonatype IQ Server!  If you need to choose
//                     an application, do so now.
//                   </NxStatefulSuccessAlert>
//                 )}
//                 {errorLoggingIn !== '' && (
//                   <NxStatefulErrorAlert>
//                     There was an error signing in, it looks like: {errorLoggingIn}
//                   </NxStatefulErrorAlert>
//                 )}
//               {/*</NxForm>*/}
//             </section>
//           </NxGrid.Row>
//         </React.Fragment>
//       );
//     }
//     return null;
//   };

//   return renderOptions();
// };

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
