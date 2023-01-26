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
import {ComponentContainer, ComponentDetails, SecurityData} from '@sonatype/js-sona-types';
import {
  NxList,
  NxLoadingSpinner,
  NxPolicyViolationIndicator,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import React, {useContext} from 'react';
import {NexusContext, NexusContextInterface} from '../../../../../context/NexusContext';
import {REMEDIATION_LABELS} from '../../../../../utils/Constants';
import './AllVersionsDetails.css';
import {PackageURL} from 'packageurl-js';
import SecurityThreat from '../../../../Common/SecurityThreat/SecurityThreat';
import SecurityThreatIconOnly from '../../../../Common/SecurityThreat/SecurityThreatIconOnly';

const AllVersionsDetails = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderAllVersionsDetails = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext.componentVersionsDetails?.length > 0) {
      const allVersionsDetails: ComponentContainer[] = nexusContext.componentVersionsDetails;

      return (
        <NxList>
          {allVersionsDetails &&
            allVersionsDetails.map((componentDetail) => {
              const securityData: SecurityData = componentDetail.securityData;
              let maxSeverity = 0;
              if (securityData.securityIssues?.length > 0) {
                maxSeverity = Math.max(
                  ...securityData.securityIssues.map((issue) => issue.severity)
                );
              }
              const purl = PackageURL.fromString(componentDetail.component.packageUrl.toString());

              return (
                <NxList.Item key={purl.version}>
                  <NxList.Text>
                    <p className="nx-p">{purl.version}</p>
                  </NxList.Text>
                  <NxList.Subtext>
                    <NxPolicyViolationIndicator
                      policyThreatLevel={Math.round(maxSeverity) as ThreatLevelNumber}
                    />{' '}
                  </NxList.Subtext>
                </NxList.Item>
              );
            })}
        </NxList>
      );
    } else {
      return <NxLoadingSpinner />;
    }
    return null;
  };

  return renderAllVersionsDetails(nexusContext);
};

export default AllVersionsDetails;
