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
import {NxButton, NxFormGroup, NxStatefulTextInput} from '@sonatype/react-shared-components';

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

  const setItem = (func: any, value: any, key: string) => {
    func(value);
    chrome.storage.local.set({[key]: value});
  };

  const validator = (val: string) => {
    return val.length ? null : 'Must be non-empty';
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
        <form className="nx-form">
          <NxFormGroup label={`Nexus IQ Server URL`} isRequired>
            <NxStatefulTextInput
              defaultValue={iqServerURL}
              aria-required={true}
              validator={validator}
              onChange={(event) => setItem(setIQServerURL, event, IQ_SERVER_URL)}
            />
          </NxFormGroup>
          <NxButton type="button" onClick={askForPermissions}>
            Grant Permissions to IQ Server URL
          </NxButton>
          <NxFormGroup label={`Nexus IQ Server Username`} isRequired>
            <NxStatefulTextInput
              defaultValue={iqServerUser}
              aria-required={true}
              validator={validator}
              onChange={(event) => setItem(setIQServerUser, event, IQ_SERVER_USER)}
            />
          </NxFormGroup>
          <NxFormGroup label={`Nexus IQ Server Token`} isRequired>
            <NxStatefulTextInput
              defaultValue={iqServerToken}
              aria-required={true}
              validator={validator}
              type="password"
              onChange={(event) => setItem(setIQServerToken, event, IQ_SERVER_TOKEN)}
            />
          </NxFormGroup>
          <NxFormGroup label={`Nexus IQ Server Application`} isRequired>
            <NxStatefulTextInput
              defaultValue={iqServerApplication}
              aria-required={true}
              validator={validator}
              onChange={(event) => setItem(setIQServerApplication, event, IQ_SERVER_APPLICATION)}
            />
          </NxFormGroup>
        </form>
      );
    }
    return null;
  };

  return renderOptions();
};

export default IQServerOptionsPage;
