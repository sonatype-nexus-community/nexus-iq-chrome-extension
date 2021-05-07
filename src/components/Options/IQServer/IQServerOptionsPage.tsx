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
import React from 'react';
import {NxButton, NxFormGroup, NxStatefulTextInput} from '@sonatype/react-shared-components';
import useLocalStorage from '../../../hooks/useLocalStorage';

const IQServerOptionsPage = (): JSX.Element => {
  const [iqServerURL, setIQServerURL] = useLocalStorage('iqServerURL', '');
  const [iqServerUser, setIQServerUser] = useLocalStorage('iqServerUser', '');
  const [iqServerToken, setIQServerToken] = useLocalStorage('iqServerToken', '');

  console.info('Loading IQ Server Options Page');

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
    return (
      <form className="nx-form">
        <NxFormGroup label={`Nexus IQ Server URL`} isRequired>
          <NxStatefulTextInput
            defaultValue={iqServerURL}
            aria-required={true}
            validator={validator}
            onChange={setIQServerURL}
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
            onChange={setIQServerUser}
          />
        </NxFormGroup>
        <NxFormGroup label={`Nexus IQ Server Token`} isRequired>
          <NxStatefulTextInput
            defaultValue={iqServerToken}
            aria-required={true}
            validator={validator}
            type="password"
            onChange={setIQServerToken}
          />
        </NxFormGroup>
      </form>
    );
  };

  return renderOptions();
};

export default IQServerOptionsPage;
