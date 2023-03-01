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
import React, {useContext} from 'react';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
import './PolicyPage.css';
import PolicyViolation from './PolicyViolation/PolicyViolation';

const PolicyPage = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderPolicyViolation = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.policyDetails &&
      // nexusContext.policyDetails.results &&
      nexusContext.policyDetails.results.length > 0 // &&
      // nexusContext.policyDetails.results[0].policyData &&
      // nexusContext.policyDetails.results[0].policyData.policyViolations
    ) {
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
                  {nexusContext.policyDetails.results[0].policyData.policyViolations.map(
                    (violation) => {
                      return (
                        <PolicyViolation
                          key={violation.policyId}
                          policyViolation={violation}
                        ></PolicyViolation>
                      );
                    }
                  )}
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
