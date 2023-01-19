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
import {NxList} from '@sonatype/react-shared-components';
import {ConstraintViolation, PolicyViolation, Reason} from '@sonatype/js-sona-types';
import '../PolicyPage.css';

type PolicyViolationProps = {
  policyViolation: PolicyViolation;
};

const PolicyViolation = (props: PolicyViolationProps): JSX.Element | null => {
  const [open, setOpen] = useState(false);

  const printPolicyViolation = (policyViolation: PolicyViolation) => {
    if (policyViolation) {
      return (
        <tr className="nx-table-row">
          <td className="nx-cell">{policyViolation.threatLevel}</td>
          {policyViolation.constraintViolations &&
            policyViolation.constraintViolations.map((constraint: ConstraintViolation) => (
              <React.Fragment key={constraint.constraintName}>
                <td className="nx-cell">{policyViolation.policyName}</td>
                <td className="nx-cell">{constraint.constraintName}</td>

                <td className="nx-cell">
                  <NxList>
                    {constraint.reasons.map((reason: Reason) => (
                      // eslint-disable-next-line react/jsx-key
                      <NxList.Item className="nx-list-in-cell">
                        <NxList.Text>{reason.reason}</NxList.Text>
                      </NxList.Item>
                    ))}
                  </NxList>
                </td>
              </React.Fragment>
            ))}
        </tr>
      );
    }
    return null;
  };

  return printPolicyViolation(props.policyViolation);
};

export default PolicyViolation;
