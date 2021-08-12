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
import VulnDetails from './VulnDetails/VulnDetails';
import {
  NxAccordion,
  NxPolicyViolationIndicator,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import {SecurityIssue} from '../../../../../types/ArtifactMessage';
import {NexusContext, NexusContextInterface} from '../../../../../context/NexusContext';
import {useContext} from 'react';

type SecurityItemProps = {
  securityIssue: SecurityIssue;
  open: boolean;
  packageUrl: string;
  remediationEvent: (vulnID: string) => void;
};

const SecurityItemDisplay = (props: SecurityItemProps): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderSecurityItem = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext && nexusContext.getVulnDetails) {
      return (
        <NxAccordion
          open={props.open}
          onToggle={() => {
            props.remediationEvent(props.securityIssue.reference);
            nexusContext.getVulnDetails(props.securityIssue.reference);
          }}
        >
          <NxAccordion.Header>
            <h2 className="nx-accordion__header-title">{props.securityIssue.reference}</h2>
            <div className="nx-btn-bar">
              <NxPolicyViolationIndicator
                policyThreatLevel={Math.round(props.securityIssue.severity) as ThreatLevelNumber}
              />
            </div>
          </NxAccordion.Header>
          <h3 className="nx-h3">Details</h3>
          <VulnDetails />
        </NxAccordion>
      );
    }
    return null;
  };

  return renderSecurityItem(nexusContext);
};

export default SecurityItemDisplay;
