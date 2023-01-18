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
import React, {useEffect, useState} from 'react';
import {
  NxForm,
  NxFormGroup,
  NxGrid,
  NxStatefulErrorAlert,
  NxStatefulSuccessAlert,
  NxStatefulTextInput,
  NxDescriptionList
} from '@sonatype/react-shared-components';
import {IqRequestService, LogLevel, TestLogger} from '@sonatype/js-sona-types';
import classnames from 'classnames';
import {DATA_SOURCES} from '../../../utils/Constants';
import './IQServerOptionsPage.css';

const IQ_SERVER_URL = 'iqServerURL';
const IQ_SERVER_USER = 'iqServerUser';
const IQ_SERVER_TOKEN = 'iqServerToken';
const IQ_SERVER_APPLICATION = 'iqServerApplication';
const SCAN_TYPE = 'scanType';

const IQServerOptionsPage = (): JSX.Element | null => {
  const [iqServerURL, setIQServerURL] = useState('');
  const [iqServerUser, setIQServerUser] = useState('');
  const [iqServerToken, setIQServerToken] = useState('');
  const [iqServerApplication, setIQServerApplication] = useState('');
  const [currentScanType, setCurrentScanType] = useState(DATA_SOURCES.OSSINDEX);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorLoggingIn, setErrorLoggingIn] = useState('');

  const isSubmittable =
    iqServerURL !== '' && iqServerUser !== '' && iqServerToken !== '' && iqServerApplication !== '';

  const submitBtnClasses = classnames({disabled: !isSubmittable}),
    submitTooltip = isSubmittable ? '' : 'Required fields are missing';

  const nonEmptyValidator = (val: string) => (val && val.length ? null : 'Must be non-empty');

  useEffect(() => {
    chrome.storage.local.get((items: {[key: string]: any}) => {
      if (items[IQ_SERVER_URL]) {
        setIQServerURL(items[IQ_SERVER_URL]);
      }
      if (items[IQ_SERVER_USER]) {
        setIQServerUser(items[IQ_SERVER_USER]);
      }
      if (items[IQ_SERVER_TOKEN]) {
        setIQServerToken(items[IQ_SERVER_TOKEN]);
      }
      if (items[IQ_SERVER_APPLICATION]) {
        setIQServerApplication(items[IQ_SERVER_APPLICATION]);
      }
      if (items[SCAN_TYPE]) {
        setCurrentScanType(items[SCAN_TYPE]);
      }
      setLoading(false);
    });
  }, [iqServerApplication, iqServerToken, iqServerURL, iqServerUser, currentScanType]);

  const setItem = (setter: any, value: string, key: string) => {
    setter(value);
    chrome.storage.local.set({[key]: value}, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.trace('Set value', key, value);
      }
    });
  };

  const onSubmit = (): void => {
    doSubmit();
  };

  const doSubmit = async () => {
    if (isSubmittable) {
      try {
        const requestService = new IqRequestService({
          user: iqServerUser as string,
          token: iqServerToken,
          host: iqServerURL,
          application: iqServerApplication,
          logger: new TestLogger(LogLevel.ERROR),
          product: 'nexus-chrome-extension',
          version: '1.0.0',
          browser: true
        });

        const loggedIn = await requestService.loginViaRest();

        if (loggedIn) {
          console.trace('Able to login to Nexus IQ Server');
          setErrorLoggingIn('');
          console.trace('Set error logging in to empty');
          setLoggedIn(loggedIn);
          console.trace('Set logged in on state to true');
          setItem(setCurrentScanType, DATA_SOURCES.NEXUSIQ, SCAN_TYPE);
        } else {
          console.error('Unable to login to Nexus IQ Server');
          setErrorLoggingIn('Unable to login');
          console.trace('Set error logging in to message');
          setLoggedIn(false);
          console.trace('Set logged in on state to false');
        }
      } catch (err) {
        console.error('Unable to login to Nexus IQ Server');
        setErrorLoggingIn(err);
        console.trace('Set error logging in to message');
        setLoggedIn(false);
        console.trace('Set logged in on state to false');
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
        } else {
          console.debug('Not granted!!');
        }
      }
    );
  };

  const renderOptions = () => {
    if (!loading) {
      return (
        <React.Fragment>
          <NxGrid.Row>
            <section className="nx-grid-col nx-grid-col--67">
              <header className="nx-grid-header">
                <h3 className="nx-h3 nx-grid-header__title">IQ Server Quick Setup</h3>
              </header>
              <hr className="nx-grid-h-keyline" />
              <NxForm
                onSubmit={onSubmit}
                submitBtnText={`Test Connectivity`}
                submitBtnClasses={submitBtnClasses}
                showValidationErrors={true}
              >
                <p className="nx-p">
                  <strong>1)</strong> Enter the URL for Nexus IQ Server
                </p>
                <NxFormGroup label={`IQ Server URL`} isRequired>
                  <NxStatefulTextInput
                    defaultValue={iqServerURL}
                    validator={nonEmptyValidator}
                    onChange={(event) => setItem(setIQServerURL, event, IQ_SERVER_URL)}
                  />
                </NxFormGroup>
                <p className="nx-p">
                  <strong>2)</strong> Allow the extension to communicate with Nexus IQ Server
                </p>
                <button className="nx-btn grant-permissions" onClick={askForPermissions}>
                  Grant Permissions to IQ Server URL
                </button>
                <p className="nx-p">
                  <strong>3)</strong> Provide username and token for Nexus IQ Server
                </p>
                <div className="nx-form-row">
                  <NxFormGroup label={`IQ Server Username`} isRequired>
                    <NxStatefulTextInput
                      defaultValue={iqServerUser}
                      validator={nonEmptyValidator}
                      onChange={(event) => setItem(setIQServerUser, event, IQ_SERVER_USER)}
                    />
                  </NxFormGroup>
                  <NxFormGroup label={`IQ Server Token`} isRequired>
                    <NxStatefulTextInput
                      defaultValue={iqServerToken}
                      validator={nonEmptyValidator}
                      type="password"
                      onChange={(event) => setItem(setIQServerToken, event, IQ_SERVER_TOKEN)}
                    />
                  </NxFormGroup>
                </div>
                <p className="nx-p">
                  <strong>4)</strong> Set application
                </p>
                <NxFormGroup label={`IQ Server Application`} isRequired>
                  <NxStatefulTextInput
                    defaultValue={iqServerApplication}
                    validator={nonEmptyValidator}
                    onChange={(event) =>
                      setItem(setIQServerApplication, event, IQ_SERVER_APPLICATION)
                    }
                  />
                </NxFormGroup>
                <p className="nx-p">
                  <strong>5)</strong> Do a quick test to ensure you can connect to Nexus IQ Server
                </p>
                {loggedIn && (
                  <NxStatefulSuccessAlert>
                    Congrats! You are able to login to Nexus IQ Server!
                  </NxStatefulSuccessAlert>
                )}
                {errorLoggingIn !== '' && (
                  <NxStatefulErrorAlert>
                    There was an error logging in, it looks like: {errorLoggingIn}
                  </NxStatefulErrorAlert>
                )}
              </NxForm>
            </section>
            <section className="nx-grid-col nx-grid-col--33">
              {/*<img src="images/billymays.png" width={420} height={420} />*/}
              {/*<blockquote className="nx-blockquote">*/}
              {/*  <em>&quot;Don&apos;t just clean your products, Sona-clean them&quot;</em>*/}
              {/*</blockquote>*/}
              <header className="nx-grid-header">
                <h3 className="nx-h3 nx-grid-header__title">Current Configuration</h3>
              </header>
              <NxDescriptionList>
                <NxDescriptionList.Item>
                  <NxDescriptionList.Term>Evaluation Type</NxDescriptionList.Term>
                  <NxDescriptionList.Description>{currentScanType}</NxDescriptionList.Description>
                </NxDescriptionList.Item>
              </NxDescriptionList>
            </section>
          </NxGrid.Row>
        </React.Fragment>
      );
    }
    return null;
  };

  return renderOptions();
};

export default IQServerOptionsPage;
