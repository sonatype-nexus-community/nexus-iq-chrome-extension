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
// import {IqRequestService, LogLevel, TestLogger} from "../../../../../js-sona-types";
import {IqRequestService, LogLevel, TestLogger} from "@sonatype/js-sona-types";
import {
  NxFormGroup,
  NxGrid,
  NxStatefulErrorAlert,
  NxStatefulSuccessAlert,
  NxStatefulTextInput,
  NxTooltip,
  NxFontAwesomeIcon,
  NxFormSelect,
  NxButton
} from '@sonatype/react-shared-components';
import React, {useEffect, useState, FormEvent, useContext} from 'react';
import {DATA_SOURCES} from '../../../utils/Constants';
import './IQServerOptionsPage.css';
import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {NexusContext, NexusContextInterface} from "../../../context/NexusContext";


const IQ_SERVER_URL = 'iqServerURL';
const IQ_SERVER_USER = 'iqServerUser';
const IQ_SERVER_TOKEN = 'iqServerToken';
const IQ_SERVER_APPLICATION = 'iqServerApplication';
const SCAN_TYPE = 'scanType';

const IQServerOptionsPage = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const [iqServerURL, setIQServerURL] = useState('');
  const [iqServerUser, setIQServerUser] = useState('');
  const [iqServerToken, setIQServerToken] = useState('');
  const [iqServerApplication, setIQServerApplication] = useState('');
  // const [iqServerApplications, setIQServerApplications] = useState([]);
  const [currentScanType, setCurrentScanType] = useState(DATA_SOURCES.OSSINDEX);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [hasPermissions, setPermissions] = useState(false);
  const [errorLoggingIn, setErrorLoggingIn] = useState('');

  const isSubmittable =
    iqServerURL !== '' && iqServerUser !== '' && iqServerToken !== '';
  // iqServerURL !== '' && iqServerUser !== '' && iqServerToken !== '' && iqServerApplication !== '';

  // const submitBtnClasses = classnames({disabled: !isSubmittable});
  // submitTooltip = isSubmittable ? '' : 'Required fields are missing';

  const nonEmptyValidator = (val: string) => (val && val.length ? null : 'Must be non-empty');

  // const checkPermissions = (): boolean => {
  //   console.info('Checking chrome extension permissions.  Current iqServerUrl: ', iqServerURL.endsWith('/') ? iqServerURL : `${iqServerURL}/`);
  //   const originsUrl = iqServerURL.endsWith('/') ? `${iqServerURL}*` : `${iqServerURL}/*`
  //   console.info('Checking chrome extension permissions.  originsUrl: ', originsUrl);
  //   chrome.permissions.contains({
  //     origins: [originsUrl]
  //   }, (result) => {
  //     if (result) {
  //       console.info('Chrome extension permissions are set for: ', originsUrl);
  //       setPermissions(true);
  //       return true;
  //     }
  //     setPermissions(false);
  //     return false;
  //   });
  //   return false;
  // };

  const getSettings = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chrome.storage.local.get((items: {[key: string]: any}) => {
      if (items[IQ_SERVER_URL] !== undefined) {
        setIQServerURL(items[IQ_SERVER_URL]);
      }
      if (items[IQ_SERVER_USER] !== undefined) {
        setIQServerUser(items[IQ_SERVER_USER]);
      }
      if (items[IQ_SERVER_TOKEN] !== undefined) {
        setIQServerToken(items[IQ_SERVER_TOKEN]);
      }
      if (items[IQ_SERVER_APPLICATION] !== undefined) {
        setIQServerApplication(items[IQ_SERVER_APPLICATION]);
      }
      if (items[SCAN_TYPE] !== undefined) {
        setCurrentScanType(items[SCAN_TYPE]);
      }
      setLoading(false);

    });
  }

  useEffect(() => {
    getSettings();
  }, [iqServerApplication, iqServerToken, iqServerURL, iqServerUser, currentScanType]);

  // useEffect(() => {
  //   console.info("In useEffect that should only be called once");
  //   // getAllPermissions();
  //   // const permissions = checkPermissions();
  //   if (iqServerURL !== '' && iqServerUser !== '' && iqServerToken !== '') {
  //     console.info("In useEffect and calling getApplications.");
  //     void getApplications()
  //   }
  // },[iqServerURL]);

  // useEffect(() => {
  //   const getApplications = async () => {
  //     getSettings();
  //     try {
  //       const requestService = new IqRequestService({
  //         user: iqServerUser as string,
  //         token: iqServerToken,
  //         host: iqServerURL,
  //         application: 'sandbox-application',
  //         logger: new TestLogger(LogLevel.ERROR),
  //         product: 'nexus-chrome-extension',
  //         version: '1.0.0',
  //         browser: true
  //       });
  //
  //       console.info("Using requestService: ", requestService);
  //       const response: IqApplicationResponse = await requestService.getApplications();
  //
  //       if (response.applications.length > 0) {
  //         const opts = [];
  //         response.applications.map((app) => {
  //           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //           // @ts-ignore
  //           return opts.push({value: app.publicId, label: app.name});
  //         });
  //         setIQServerApplications(opts)
  //         console.info("Select options: ", opts);
  //       }
  //     } catch (err) {
  //       if (err instanceof Error) {
  //         throw new Error(err.message);
  //       }
  //       throw new Error("Unknown error in getApplications");
  //     }
  //   };
  //   if (iqServerToken && iqServerApplication && iqServerURL && iqServerUser) {
  //     void getApplications();
  //   }
  // },[iqServerApplication, iqServerToken, iqServerURL, iqServerUser]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setItem = (setter: any, value: string, key: string) => {
    console.info('setItem: ', key, value);
    setter(value);
    chrome.storage.local.set({[key]: value}, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      }
    });
  };

  const onSubmit = (): void => {
    console.info("In onSubmit...");
    void doSubmit();
  };

  const doSubmit = async () => {
    console.info("In doSubmit...");
    if (isSubmittable) {
      try {
        const requestService = new IqRequestService({
          user: iqServerUser as string,
          token: iqServerToken,
          host: iqServerURL,
          application: 'sandbox-application',
          logger: new TestLogger(LogLevel.ERROR),
          product: 'nexus-chrome-extension',
          version: '1.0.0',
          browser: true
        });

        console.info("using requestService: ", requestService);
        const loggedIn = await requestService.loginViaRest();

        if (loggedIn) {
          setErrorLoggingIn('');
          setLoggedIn(loggedIn);
          setItem(setCurrentScanType, DATA_SOURCES.NEXUSIQ, SCAN_TYPE);
          setItem(setIQServerURL, iqServerURL, IQ_SERVER_URL);
          setItem(setIQServerUser, iqServerUser, IQ_SERVER_USER);
          setItem(setIQServerToken, iqServerToken, IQ_SERVER_TOKEN);

        } else {
          setErrorLoggingIn('Unable to login');
          setLoggedIn(false);
        }
      } catch (err) {
        setErrorLoggingIn(err);
        setLoggedIn(false);
      }
    }
  };

  const askForPermissions = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(event);

    console.info('grantOriginsPermissions');

    chrome.permissions.request(
      {
        origins: [iqServerURL.endsWith('/') ? iqServerURL : `${iqServerURL}/`]
      },
      (granted) => {
        if (granted) {
          console.debug('Granted!!!');
          setPermissions(true);
        } else {
          console.debug('Not granted!!');
          setPermissions(false);
        }
      }
    );
  };
  //
  // const getAllPermissions = () => {
  //   console.debug('Getting all chrome extension permissions.');
  //   chrome.permissions.getAll((result) => {
  //       console.debug('All chrome permissions: ', result);
  //   });
  // };

  function onChange(evt: FormEvent<HTMLSelectElement>) {
    console.info("Setting iqServerApplication: ", evt.currentTarget.value);
    // setIQServerApplication(evt.currentTarget.value);
    setItem(setIQServerApplication, evt.currentTarget.value, IQ_SERVER_APPLICATION)
  }

  const renderOptions = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext && nexusContext.getApplications) {
      if (!nexusContext.applications) {
        console.info("Trying to getApplications in renderOptions.");
        nexusContext.getApplications();
      } else {
        console.info("exists - nexusContext.applications in renderOptions.", nexusContext.applications);
      }
    } else {
      console.info("nexusContext && nexusContext.getApplications is not found.");
    }
    if (!loading) {

      return (
        <React.Fragment>
          <NxGrid.Row>
            <section className="nx-grid-col nx-grid-col--100">
                <p className="nx-p">
                  <strong>1)</strong> Enter the URL for the Sonatype IQ Server
                    and grant the permissions needed for the extension to communicate with the Sonatype IQ
                    Server.
                  </p>

                <div className="nx-form-row">
                <NxFormGroup label={`URL`} isRequired>
                  <NxStatefulTextInput
                    defaultValue={iqServerURL}
                    placeholder="https://your-iq-server-url"
                    validator={nonEmptyValidator}
                    onChange={(event) => {
                      setItem(setIQServerURL, event.endsWith('/') ? event.slice(0, -1) : event, IQ_SERVER_URL);
                    }}
                  />
                </NxFormGroup>
                  {!hasPermissions && (
                      // {!checkPermissions() && (
                      <button className="nx-btn grant-permissions" onClick={askForPermissions}>
                        Grant Permissions to the Sonatype IQ Server URL
                      </button>
                  )}

                </div>
                <p className="nx-p">
                  <strong>2)</strong> Provide your username and token for the Sonatype IQ Server.  Then connect to
                  retrieve the list of applications available.
                </p>
                <div className="nx-form-row">
                  <NxFormGroup label={`Username`} isRequired>
                    <NxStatefulTextInput
                      defaultValue={iqServerUser}
                      validator={nonEmptyValidator}
                      onChange={(event) => setItem(setIQServerUser, event, IQ_SERVER_USER)}
                    />
                  </NxFormGroup>
                  <NxFormGroup label={`Token`} isRequired>
                    <NxStatefulTextInput
                      defaultValue={iqServerToken}
                      validator={nonEmptyValidator}
                      type="password"
                      onChange={(event) => setItem(setIQServerToken, event, IQ_SERVER_TOKEN)}
                    />
                  </NxFormGroup>
                  <NxButton
                      variant="primary"
                      onClick={onSubmit}>Connect
                  </NxButton>

                </div>

              { nexusContext && nexusContext.applications && nexusContext.applications.length > 0 && (
                <React.Fragment>
                  <p className="nx-p">
                    <strong>3)</strong> Set the Sonatype Lifecycle Application.
                    <NxTooltip title="The application policies that components will be evaluated against.">
                      <NxFontAwesomeIcon
                          icon={faQuestionCircle as IconDefinition} />
                    </NxTooltip>

                  </p>

                  <NxFormGroup label={`Sonatype Lifecycle Application`} isRequired>
                    <NxFormSelect value={iqServerApplication} onChange={onChange} disabled={!loggedIn} >
                      {nexusContext.applications.map((app) => {
                        return (
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            <option key={app.value} value={app.value}>{app.label}</option>
                        )
                      })}
                    </NxFormSelect>
                  </NxFormGroup>
                </React.Fragment>
              )}


                {loggedIn && (
                  <NxStatefulSuccessAlert>
                    Congrats! You are able to sign in to your Sonatype IQ Server!  If you need to choose
                    an application, do so now.
                  </NxStatefulSuccessAlert>
                )}
                {errorLoggingIn !== '' && (
                  <NxStatefulErrorAlert>
                    There was an error signing in, it looks like: {errorLoggingIn}
                  </NxStatefulErrorAlert>
                )}
              {/*</NxForm>*/}
            </section>
          </NxGrid.Row>
        </React.Fragment>
      );
    }
    return null;
  };

  return renderOptions(nexusContext);
};

export default IQServerOptionsPage;
