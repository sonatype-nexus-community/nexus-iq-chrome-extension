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
import React, {useState} from 'react';
import {NxAccordion, NxPolicyViolationIndicator} from '@sonatype/react-shared-components';
import {ConstraintViolation, PolicyViolation, Reason} from '@sonatype/js-sona-types';

type PolicyViolationProps = {
  policyViolation: PolicyViolation;
};

const PolicyViolation = (props: PolicyViolationProps): JSX.Element | null => {
  const [open, setOpen] = useState(false);

  const printPolicyViolation = (policyViolation: PolicyViolation) => {
    if (policyViolation) {
      return (
        <section className="nx-tile nx-viewport-sized__container">
          <NxAccordion open={open} onToggle={setOpen}>
            <NxAccordion.Header>
              <NxAccordion.Title>{policyViolation.policyName}</NxAccordion.Title>
              <div className="nx-btn-bar">
                <NxPolicyViolationIndicator
                  policyThreatLevel={Math.round(policyViolation.threatLevel) as any}
                />
              </div>
            </NxAccordion.Header>
            <p className="nx-p">
              <table className="nx-table">
                <thead>
                  <tr className="nx-table-row nx-table-row--header">
                    <th className="nx-cell nx-cell--header nx-cell--num">Threat</th>
                    <th className="nx-cell nx-cell--header">Constraint Name</th>
                    <th className="nx-cell nx-cell--header">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="nx-table-row">
                    <td className="nx-cell">{policyViolation.threatLevel}</td>
                    {policyViolation.constraintViolations &&
                      policyViolation.constraintViolations.map(
                        (constraint: ConstraintViolation) => (
                          <React.Fragment key={constraint.constraintName}>
                            <td className="nx-cell">{constraint.constraintName}</td>
                            <td className="nx-cell">
                              <ul className="nx-list">
                                {constraint.reasons.map((reason: Reason) => (
                                  <li key={reason.reason} className="nx-list__item">
                                    <span className="nx-list__text">{reason.reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </React.Fragment>
                        )
                      )}
                  </tr>
                </tbody>
              </table>
            </p>
          </NxAccordion>
        </section>
      );
    }
    return null;
  };

  return printPolicyViolation(props.policyViolation);
};

export default PolicyViolation;
