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
              <h2 className="nx-accordion__header-title">{policyViolation.policyName}</h2>
              <div className="nx-btn-bar">
                <NxPolicyViolationIndicator
                  policyThreatLevel={Math.round(policyViolation.threatLevel) as any}
                />
              </div>
            </NxAccordion.Header>
            <h2 className="nx-h2">Threat Level: {policyViolation.threatLevel}</h2>
            {policyViolation.constraintViolations &&
              policyViolation.constraintViolations.map((constraint: ConstraintViolation) => (
                <React.Fragment key={constraint.constraintName}>
                  <h3 className="nx-h3">Constraint: {constraint.constraintName}</h3>
                  <h3 className="nx-h3">Reasons</h3>
                  <ul className="nx-list">
                    {constraint.reasons.map((reason: Reason) => (
                      <li key={reason.reason} className="nx-list__item">
                        <span className="nx-list__text">{reason.reason}</span>
                      </li>
                    ))}
                  </ul>
                </React.Fragment>
              ))}
          </NxAccordion>
        </section>
      );
    }
    return null;
  };

  return printPolicyViolation(props.policyViolation);
};

export default PolicyViolation;
