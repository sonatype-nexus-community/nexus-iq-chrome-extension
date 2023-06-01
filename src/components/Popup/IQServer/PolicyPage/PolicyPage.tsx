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
import React, {useContext, useEffect, useState} from 'react';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
import './PolicyPage.css';
import PolicyViolation from './PolicyViolation/PolicyViolation';

const PolicyPage = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const [iqServerUrl, setIqServerUrl] = useState('');

  useEffect(() => {
    chrome.storage.local.get('iqServerURL', function (result) {
      console.log(`get local storage result: ${result.iqServerURL}`);
      setIqServerUrl(result.iqServerURL);
    });
  });

  const renderPolicyViolation = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.policyDetails &&
      nexusContext.policyDetails.results.length > 0
    ) {
      const pv = nexusContext.policyDetails.results[0].policyData.policyViolations.sort(
        (a, b) => b.threatLevel - a.threatLevel
      );
      // const ascMap = pv
      // console.log( pv, ascMap);
      return (
        <React.Fragment>
          <div className="nx-grid-row">
            <section className="nx-grid-col nx-grid-col--100 nx-scrollable">
              <table className="nx-table">
                <thead>
                  <tr className="nx-table-row nx-table-row--header">
                    <th className="nx-cell nx-cell--header nx-cell--num">Threat</th>
                    <th className="nx-cell nx-cell--header">Policy</th>
                    <th className="nx-cell nx-cell--header">Constraint Name</th>
                    <th className="nx-cell nx-cell--header">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {pv.map((violation, index) => {
                    return (
                      <PolicyViolation
                        key={`violation${index}`}
                        policyViolation={violation}
                        iqServerUrl={iqServerUrl}
                      ></PolicyViolation>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </div>
        </React.Fragment>
      );
    }
    return null;
  };

  return renderPolicyViolation(nexusContext);
};

export default PolicyPage;
