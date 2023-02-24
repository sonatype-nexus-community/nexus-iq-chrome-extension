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
  NxFormGroup,
  NxFormSelect,
  nxFormSelectStateHelpers
} from '@sonatype/react-shared-components';
import {LogLevel} from '@sonatype/js-sona-types';

const LOG_LEVEL = 'logLevel';

const GeneralOptionsPage = (): JSX.Element | null => {
  const [logLevel, setLogLevel] = nxFormSelectStateHelpers.useNxFormSelectState<number>(
    LogLevel.ERROR
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chrome.storage.local.get((items: {[key: string]: any}) => {
      if (items[LOG_LEVEL]) {
        setLogLevel(items[LOG_LEVEL]);
      }
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [logLevel]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setItem = (func: any, event: any, key: string) => {
    console.log(event.target.value);
    func(parseInt(event.target.value));
    chrome.storage.local.set({[key]: parseInt(event.target.value)});
  };

  const renderOptions = () => {
    if (!loading) {
      return (
        <form className="nx-form">
          <NxFormGroup label={`Extension Log Level`} isRequired>
            <NxFormSelect
              onChange={(event) => setItem(setLogLevel, event, LOG_LEVEL)}
              {...logLevel}
            >
              {Object.keys(LogLevel)
                .filter((key) => !isNaN(Number(LogLevel[key])))
                .map((val, key) => {
                  return (
                    <option key={key} value={key}>
                      {LogLevel[key]}
                    </option>
                  );
                })}
            </NxFormSelect>
          </NxFormGroup>
        </form>
      );
    }
    return null;
  };

  return renderOptions();
};

export default GeneralOptionsPage;
