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
import {
  NxH3,
  NxPolicyViolationIndicator,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import {SecurityData} from '@sonatype/js-sona-types';
import {NexusContext, NexusContextInterface} from '../../../context/NexusContext';

const SecurityThreat = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderSecurityThreat = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.componentDetails &&
      nexusContext.componentDetails.securityData
    ) {
      return getSecurityThreat(nexusContext.componentDetails.securityData);
    } else if (
      // TODO: when to show policy vs. componentDetails
      nexusContext.policyDetails.results?.length > 0 &&
      nexusContext.policyDetails.results[0].securityData
    ) {
      return getSecurityThreat(nexusContext.policyDetails.results[0].securityData);
    } else {
      return null;
    }
  };

  const getSecurityThreat = (securityData: SecurityData | undefined) => {
    if (securityData && securityData.securityIssues && securityData.securityIssues.length > 0) {
      const maxSeverity = Math.max(...securityData.securityIssues.map((issue) => issue.severity));
      return (
        <React.Fragment>
          <header className="nx-grid-header">
            <h3 className={'nx-h3'}>Max Security Threat</h3>
          </header>
          <NxPolicyViolationIndicator
            policyThreatLevel={Math.round(maxSeverity) as ThreatLevelNumber}
          />
        </React.Fragment>
      );
    } else if (
      securityData &&
      securityData.securityIssues &&
      securityData.securityIssues.length == 0
    ) {
      <React.Fragment>
        <header className="nx-grid-header">
          <NxH3>No Security Issues</NxH3>
        </header>
        <NxPolicyViolationIndicator threatLevelCategory="none">Woohoo!</NxPolicyViolationIndicator>
      </React.Fragment>;
    }
    return null;
  };

  return renderSecurityThreat(nexusContext);
};

export default SecurityThreat;
