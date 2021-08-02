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
  NxPolicyViolationIndicator,
  NxStatefulAccordion,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
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
                return (
                  <NxStatefulAccordion key={issue.reference}>
                    <NxAccordion.Header>
                      <h2 className="nx-accordion__header-title">{issue.reference}</h2>
                      <div className="nx-btn-bar">
                        <NxPolicyViolationIndicator
                          policyThreatLevel={Math.round(issue.severity) as ThreatLevelNumber}
                        />
                      </div>
                    </NxAccordion.Header>
                    <h3>
                      Learn more at{' '}
                      <a href={issue.url} target="_blank" rel="noreferrer">
                        OSS Index
                      </a>
                    </h3>
                    <h4>Description</h4>
                    <p className="nx-p">{issue.description}</p>
                    <h4>Severity</h4>
                    <p className="nx-p">
                      <NxPolicyViolationIndicator
                        policyThreatLevel={Math.round(issue.severity) as ThreatLevelNumber}
                      />
                    </p>
                    <h4>Vector</h4>
                    <p className="nx-p">{issue.vector}</p>
                    <h4>Source</h4>
                    <p className="nx-p">{issue.source}</p>
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
