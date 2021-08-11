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
  hasValidationErrors,
  NxButton,
  NxForm,
  NxFormGroup,
  NxGrid,
  NxH3,
  NxStatefulErrorAlert,
  NxStatefulSuccessAlert,
  NxStatefulTextInput,
  NxTile
} from '@sonatype/react-shared-components';
import {IqRequestService, TestLogger} from '@sonatype/js-sona-types';
import classnames from 'classnames';
import {StateProps} from '@sonatype/react-shared-components/components/NxTextInput/types';

const IQ_SERVER_URL = 'iqServerURL';
const IQ_SERVER_USER = 'iqServerUser';
const IQ_SERVER_TOKEN = 'iqServerToken';
const IQ_SERVER_APPLICATION = 'iqServerApplication';

const IQServerOptionsPage = (): JSX.Element | null => {
  const [iqServerURL, setIQServerURL] = useState('');
  const [iqServerUser, setIQServerUser] = useState('');
  const [iqServerToken, setIQServerToken] = useState('');
  const [iqServerApplication, setIQServerApplication] = useState('');
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorLoggingIn, setErrorLoggingIn] = useState('');

  const stateHasValidationErrors = (state: StateProps) =>
      hasValidationErrors(state.validationErrors),
    isSubmittable =
      iqServerURL !== '' &&
      iqServerUser !== '' &&
      iqServerToken !== '' &&
      iqServerApplication != '';

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
      setLoading(false);
    });
  }, [iqServerApplication, iqServerToken, iqServerURL, iqServerUser]);

  const setItem = (setter: any, key: string) => (value: string) => {
    setter(value);
    chrome.storage.local.set({[key]: value});
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
          logger: new TestLogger(),
          product: 'nexus-chrome-extension',
          version: '1.0.0',
          browser: true
        });

        const loggedIn = await requestService.loginViaRest();

        if (loggedIn) {
          setErrorLoggingIn('');
          setLoggedIn(loggedIn);
        } else {
          setLoggedIn(false);
          setErrorLoggingIn('Unable to login');
        }
      } catch (err) {
        setLoggedIn(false);
        setErrorLoggingIn(err);
      }
    }
  };

  const askForPermissions = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(event);

    console.info('grantOriginsPermissions');

    chrome.permissions.request(
      {
        origins: [iqServerURL]
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
        <NxGrid.Row>
          <NxGrid.Column>
            <NxTile>
              <NxForm
                onSubmit={onSubmit}
                submitBtnText={`Test Connectivity`}
                submitBtnClasses={submitBtnClasses}
              >
                <NxTile.Header>
                  <NxH3>IQ Server Quick Setup</NxH3>
                </NxTile.Header>
                <NxTile.Content>
                  <p className="nx-p">
                    <strong>1)</strong> Enter the URL for Nexus IQ Server
                  </p>
                  <NxFormGroup label={`IQ Server URL`} isRequired>
                    <NxStatefulTextInput
                      defaultValue={iqServerURL}
                      validator={nonEmptyValidator}
                      onChange={setItem(setIQServerURL, IQ_SERVER_URL)}
                    />
                  </NxFormGroup>
                  <p className="nx-p">
                    <strong>2)</strong> Allow the extension to communicate with Nexus IQ Server
                  </p>
                  <NxButton type="button" onClick={askForPermissions}>
                    Grant Permissions to IQ Server URL
                  </NxButton>
                  <p className="nx-p">
                    <strong>3)</strong> Provide username and token for Nexus IQ Server
                  </p>
                  <div className="nx-form-row">
                    <NxFormGroup label={`IQ Server Username`} isRequired>
                      <NxStatefulTextInput
                        defaultValue={iqServerUser}
                        validator={nonEmptyValidator}
                        onChange={setItem(setIQServerUser, IQ_SERVER_USER)}
                      />
                    </NxFormGroup>
                    <NxFormGroup label={`IQ Server Token`} isRequired>
                      <NxStatefulTextInput
                        defaultValue={iqServerToken}
                        validator={nonEmptyValidator}
                        type="password"
                        onChange={setItem(setIQServerToken, IQ_SERVER_TOKEN)}
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
                      onChange={setItem(setIQServerApplication, IQ_SERVER_APPLICATION)}
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
                </NxTile.Content>
              </NxForm>
            </NxTile>
          </NxGrid.Column>
          <NxGrid.Column>
            <img src="images/billymays.png" width={420} height={420} />
            <blockquote className="nx-blockquote">
              <em>&quot;Don&apos;t just clean your products, Sona-clean them&quot;</em>
            </blockquote>
          </NxGrid.Column>
        </NxGrid.Row>
      );
    }
    return null;
  };

  return renderOptions();
};

export default IQServerOptionsPage;
