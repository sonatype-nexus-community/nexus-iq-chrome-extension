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
import {
  NxAccordion,
  NxH2,
  NxH3,
  NxH4,
  NxList,
  NxPolicyViolationIndicator,
  NxStatefulAccordion,
  NxThreatIndicator,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
import {CvssVectorExplainer} from '../../../../utils/CvssVectorExplainer';
import {useContext} from 'react';
import {SecurityIssue} from '@sonatype/js-sona-types';

const LiteSecurityPage = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderSecurityItems = (
    nexusContext: NexusContextInterface | undefined
  ): JSX.Element | null => {
    if (
      nexusContext &&
      nexusContext.componentDetails &&
      nexusContext.componentDetails.securityData &&
      nexusContext.componentDetails.securityData.securityIssues
    ) {
      return (
        <section className="nx-tile">
          <header className="nx-tile-header">
            <div className="nx-tile-header__title">
              <h2 className="nx-h2">Known Vulnerabilities</h2>
            </div>
          </header>
          <div className="nx-tile-content nx-tile-content--accordion-container">
            {nexusContext.componentDetails.securityData.securityIssues.map(
              (issue: SecurityIssue) => {
                const vectorExplained = CvssVectorExplainer(issue.vector.split('/'));
                return (
                  <NxStatefulAccordion key={issue.reference}>
                    <NxAccordion.Header>
                      <NxH2 className="nx-accordion__header-title">{issue.reference}</NxH2>
                      <div className="nx-btn-bar">
                        <NxPolicyViolationIndicator
                          policyThreatLevel={Math.round(issue.severity) as ThreatLevelNumber}
                        />
                      </div>
                    </NxAccordion.Header>
                    <NxH3>
                      Learn more at{' '}
                      <a href={issue.url} target="_blank" rel="noreferrer">
                        OSS Index
                      </a>
                    </NxH3>
                    <NxList>
                      <NxList.Item>
                        <NxList.Text>Severity</NxList.Text>
                        <NxList.Actions>
                          <NxThreatIndicator></NxThreatIndicator>
                          <NxPolicyViolationIndicator
                            policyThreatLevel={Math.round(issue.severity) as ThreatLevelNumber}
                          >
                            {issue.severity.toString()}
                          </NxPolicyViolationIndicator>
                        </NxList.Actions>
                      </NxList.Item>
                      <NxList.Item>
                        <NxList.DescriptionTerm>Description</NxList.DescriptionTerm>
                        <NxList.Description>{issue.description}</NxList.Description>
                      </NxList.Item>
                      <NxList.Item>
                        <NxList.DescriptionTerm>Source</NxList.DescriptionTerm>
                        <NxList.Description>{issue.source}</NxList.Description>
                      </NxList.Item>
                    </NxList>
                    <NxH4>CVSS Vector</NxH4>
                    <NxList>
                      {vectorExplained &&
                        Array.from(vectorExplained).map(([key, value]) => {
                          return (
                            <NxList.Item key={key}>
                              <NxList.DescriptionTerm>{key}</NxList.DescriptionTerm>
                              <NxList.Description>{value}</NxList.Description>
                            </NxList.Item>
                          );
                        })}
                    </NxList>
                  </NxStatefulAccordion>
                );
              }
            )}
          </div>
        </section>
      );
    }
    return null;
  };

  return renderSecurityItems(nexusContext);
};

export default LiteSecurityPage;
