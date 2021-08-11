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
import React from 'react';
import {
  NxH2,
  NxH3,
  NxList,
  NxP,
  NxPolicyViolationIndicator,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import {PolicyData, SecurityData} from '@sonatype/js-sona-types';
import {PackageURL} from 'packageurl-js';

type ComponentInfoPageProps = {
  purl: PackageURL;
  description?: string;
  catalogDate?: Date;
  matchState?: string;
  policyData?: PolicyData;
  securityData?: SecurityData;
  hash?: string;
};

const ComponentInfoPage = (props: ComponentInfoPageProps): JSX.Element | null => {
  const formatDate = (date: Date | undefined | null): string => {
    if (date) {
      const dateTime = new Date(date);
      return dateTime.toDateString();
    }
    return 'Unknown';
  };

  const renderCIPPage = () => {
    return (
      <React.Fragment>
        <div className="nx-grid-row">
          <section className="nx-grid-col--75">
            <NxH2>{props.purl.toString()}</NxH2>
            {props.description && <NxP>{props.description}</NxP>}
            <NxList>
              {props.hash && (
                <NxList.Item>
                  <NxList.DescriptionTerm>Hash</NxList.DescriptionTerm>
                  <NxList.Description>{props.hash}</NxList.Description>
                </NxList.Item>
              )}
              {props.purl.namespace && (
                <NxList.Item>
                  <NxList.DescriptionTerm>Namespace</NxList.DescriptionTerm>
                  <NxList.Description>{props.purl.namespace}</NxList.Description>
                </NxList.Item>
              )}
              <NxList.Item>
                <NxList.DescriptionTerm>Name</NxList.DescriptionTerm>
                <NxList.Description>{props.purl.name}</NxList.Description>
              </NxList.Item>
              <NxList.Item>
                <NxList.DescriptionTerm>Version</NxList.DescriptionTerm>
                <NxList.Description>{props.purl.version}</NxList.Description>
              </NxList.Item>
              {props.matchState && (
                <NxList.Item>
                  <NxList.DescriptionTerm>Match State</NxList.DescriptionTerm>
                  <NxList.Description>{props.matchState}</NxList.Description>
                </NxList.Item>
              )}
              {props.catalogDate && (
                <NxList.Item>
                  <NxList.DescriptionTerm>Catalog Date</NxList.DescriptionTerm>
                  <NxList.Description>{formatDate(props.catalogDate)}</NxList.Description>
                </NxList.Item>
              )}
            </NxList>
          </section>
          <section className="nx-grid-col--25">
            {props.policyData && getPolicyViolationIndicator(props.policyData)}
            {props.securityData && getSecurityIssueIndicator(props.securityData)}
          </section>
        </div>
      </React.Fragment>
    );
  };

  const getPolicyViolationIndicator = (policyData: PolicyData | undefined): JSX.Element | null => {
    if (policyData && policyData.policyViolations && policyData.policyViolations.length > 0) {
      const maxViolation = Math.max(
        ...policyData.policyViolations.map((violation) => violation.threatLevel)
      );
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
    return null;
  };

  const getSecurityIssueIndicator = (
    securityData: SecurityData | undefined
  ): JSX.Element | null => {
    if (securityData && securityData.securityIssues && securityData.securityIssues.length > 0) {
      const maxSeverity = Math.max(...securityData.securityIssues.map((issue) => issue.severity));
      return (
        <React.Fragment>
          <NxH3>Max Security Threat</NxH3>
          <NxPolicyViolationIndicator
            policyThreatLevel={Math.round(maxSeverity) as ThreatLevelNumber}
          />
        </React.Fragment>
      );
    }
    if (securityData && securityData.securityIssues && securityData.securityIssues.length == 0) {
      <React.Fragment>
        <NxH3>No Security Issues</NxH3>
        <NxPolicyViolationIndicator threatLevelCategory="none">Woohoo!</NxPolicyViolationIndicator>
      </React.Fragment>;
    }
    return null;
  };

  return renderCIPPage();
};

export default ComponentInfoPage;
