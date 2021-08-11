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
import {
  NxH2,
  NxH3,
  NxList,
  NxPolicyViolationIndicator,
  NxTooltip,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import {PolicyData} from '@sonatype/js-sona-types';

const ComponentInfoPage = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const formatDate = (date: Date | undefined | null): string => {
    if (date) {
      const dateTime = new Date(date);
      return dateTime.toDateString();
    }
    return 'Unknown';
  };

  const renderCIPPage = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.policyDetails &&
      nexusContext.policyDetails.results &&
      nexusContext.policyDetails.results.length > 0
    ) {
      const results = nexusContext.policyDetails.results[0];
      return (
        <React.Fragment>
          <div className="nx-grid-row">
            <section className="nx-grid-col--75">
              <NxH2>{results.component.packageUrl}</NxH2>
              <NxH3>{results.component.displayName}</NxH3>
              <NxList>
                <NxList.Item>
                  <NxList.DescriptionTerm>Hash</NxList.DescriptionTerm>
                  <NxList.Description>{results.component.hash}</NxList.Description>
                </NxList.Item>
                <NxList.Item>
                  <NxList.DescriptionTerm>Version</NxList.DescriptionTerm>
                  <NxList.Description>
                    {results.component.componentIdentifier.coordinates.version}
                  </NxList.Description>
                </NxList.Item>
                <NxList.Item>
                  <NxList.DescriptionTerm>Match State</NxList.DescriptionTerm>
                  <NxList.Description>{results.matchState}</NxList.Description>
                </NxList.Item>
                <NxList.Item>
                  <NxList.DescriptionTerm>Catalog Date</NxList.DescriptionTerm>
                  <NxList.Description>{formatDate(results.catalogDate)}</NxList.Description>
                </NxList.Item>
              </NxList>
            </section>
            <section className="nx-grid-col--25">
              {getPolicyViolationIndicator(nexusContext.policyDetails.results[0].policyData)}
            </section>
          </div>
        </React.Fragment>
      );
    }
    return null;
  };

  const getPolicyViolationIndicator = (policyData: PolicyData | undefined): JSX.Element => {
    if (policyData && policyData.policyViolations && policyData.policyViolations.length > 0) {
      const violations = policyData.policyViolations;
      const maxViolation = Math.max(...violations.map((violation) => violation.threatLevel));
      return (
        <React.Fragment>
          <NxH3>Max Policy Violation</NxH3>
          <NxPolicyViolationIndicator
            policyThreatLevel={Math.round(maxViolation) as ThreatLevelNumber}
          ></NxPolicyViolationIndicator>
        </React.Fragment>
      );
    }
    if (policyData && policyData.policyViolations && policyData.policyViolations.length == 0) {
      return (
        <React.Fragment>
          <NxH3>No Policy Violations</NxH3>
          <NxPolicyViolationIndicator threatLevelCategory="none">
            Woohoo!
          </NxPolicyViolationIndicator>
        </React.Fragment>
      );
    }
    return <NxH3>Loading</NxH3>;
  };

  return renderCIPPage(nexusContext);
};

export default ComponentInfoPage;
