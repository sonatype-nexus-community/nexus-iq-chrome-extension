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
import {VersionChange} from '@sonatype/js-sona-types';
import React, {useContext} from 'react';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';

type RemediationProps = {
  getRemediationDetails: (p: string) => Promise<void>;
};

const RemediationDetails = (props: RemediationProps): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderRemediationDetails = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.remediationDetails &&
      nexusContext.remediationDetails.remediation &&
      nexusContext.remediationDetails.remediation.versionChanges &&
      nexusContext.remediationDetails.remediation.versionChanges.length > 0
    ) {
      props.getRemediationDetails(nexusContext.policyDetails.results[0].component.packageUrl);

      const versionChanges: VersionChange[] =
        nexusContext.remediationDetails.remediation.versionChanges;

      return (
        <React.Fragment>
          <h2>Suggested Remediations</h2>
          {versionChanges &&
            versionChanges.map((change) => {
              return (
                <React.Fragment key={change.type}>
                  <h2>Remediation type: {change.type}</h2>
                  <h3>Switch to: {change.data.component.packageUrl}</h3>
                </React.Fragment>
              );
            })}
        </React.Fragment>
      );
    }
    return null;
  };

  return renderRemediationDetails(nexusContext);
};

export default RemediationDetails;
