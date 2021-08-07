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
import React, {FormEvent, useEffect, useState} from 'react';
import {
  hasValidationErrors,
  NxButton,
  NxFormGroup,
  NxStatefulErrorAlert,
  NxStatefulSuccessAlert,
  NxStatefulTextInput,
  NxTooltip
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
    isValid = [iqServerURL != '', iqServerUser != '', iqServerToken != ''],
    isSubmittable = isValid;

  const submitBtnClasses = classnames({disabled: !isSubmittable}),
    submitTooltip = isSubmittable
      ? ''
      : isValid
      ? 'Validation errors are present'
      : 'Required fields are missing';

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

  const onSubmit = async (evt: FormEvent): Promise<void> => {
    evt.preventDefault();

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
    } else {
      evt.stopPropagation();
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
        <form className="nx-form" onSubmit={onSubmit}>
          <NxFormGroup label={`Nexus IQ Server URL`} isRequired>
            <NxStatefulTextInput
              defaultValue={iqServerURL}
              validator={nonEmptyValidator}
              onChange={setItem(setIQServerURL, IQ_SERVER_URL)}
            />
          </NxFormGroup>
          <NxButton type="button" onClick={askForPermissions}>
            Grant Permissions to IQ Server URL
          </NxButton>
          <NxFormGroup label={`Nexus IQ Server Username`} isRequired>
            <NxStatefulTextInput
              defaultValue={iqServerUser}
              validator={nonEmptyValidator}
              onChange={setItem(setIQServerUser, IQ_SERVER_USER)}
            />
          </NxFormGroup>
          <NxFormGroup label={`Nexus IQ Server Token`} isRequired>
            <NxStatefulTextInput
              defaultValue={iqServerToken}
              validator={nonEmptyValidator}
              type="password"
              onChange={setItem(setIQServerToken, IQ_SERVER_TOKEN)}
            />
          </NxFormGroup>
          <NxFormGroup label={`Nexus IQ Server Application`} isRequired>
            <NxStatefulTextInput
              defaultValue={iqServerApplication}
              validator={nonEmptyValidator}
              onChange={setItem(setIQServerApplication, IQ_SERVER_APPLICATION)}
            />
          </NxFormGroup>
          <footer className="nx-form-footer">
            <div className="nx-btn-bar">
              <NxTooltip title={submitTooltip}>
                <NxButton className={submitBtnClasses} variant="primary" type="submit">
                  Test Connectivity
                </NxButton>
              </NxTooltip>
            </div>
          </footer>
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
        </form>
      );
    }
    return null;
  };

  return renderOptions();
};

export default IQServerOptionsPage;
