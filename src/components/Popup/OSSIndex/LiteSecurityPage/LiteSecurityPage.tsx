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
import * as React from 'react';
import {NxPolicyViolationIndicator, ThreatLevelNumber} from '@sonatype/react-shared-components';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
import {useContext} from 'react';
import {SecurityIssue} from '../../../../types/ArtifactMessage';

const LiteSecurityPage = () => {
  const nexusContext = useContext(NexusContext);

  const renderSecurityItems = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.componentDetails &&
      nexusContext.componentDetails.securityData &&
      nexusContext.componentDetails.securityData.securityIssues
    ) {
      return (
        <React.Fragment>
          {nexusContext.componentDetails.securityData.securityIssues.map((issue: SecurityIssue) => {
            return (
              <>
                <h2 className="nx-accordion__header-title">{issue.reference}</h2>
                <div className="nx-btn-bar">
                  <NxPolicyViolationIndicator
                    policyThreatLevel={Math.round(issue.severity) as ThreatLevelNumber}
                  />
                </div>
              </>
            );
          })}
        </React.Fragment>
      );
    }
    return null;
  };

  return renderSecurityItems(nexusContext);
};

export default LiteSecurityPage;
