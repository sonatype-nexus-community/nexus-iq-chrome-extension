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
import React, {useContext, useState} from 'react';
import SecurityItemDisplay from './SecurityItemDisplay/SecurityItemDisplay';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
import {SecurityIssue, sortIssues} from '../../../../types/ArtifactMessage';

type SecurityProps = {};

const SecurityPage = (props: SecurityProps): JSX.Element | null => {
  const [open, setOpen] = useState('');

  const nexusContext = useContext(NexusContext);

  const getRemediationAndOpen = (securityIssue: string): void => {
    if (open == securityIssue) {
      setOpen('');
    } else {
      setOpen(securityIssue);
    }
  };

  const isOpen = (issue: string): boolean => {
    return issue == open;
  };

  const renderAccordion = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.policyDetails &&
      nexusContext.policyDetails.results &&
      nexusContext.policyDetails.results.length > 0 &&
      nexusContext.policyDetails.results[0].securityData
    ) {
      const purl = nexusContext.policyDetails.results[0].component.packageUrl;
      const securityData = nexusContext.policyDetails.results[0].securityData;
      const sortedIssues: SecurityIssue[] = sortIssues(securityData.securityIssues);
      return (
        <React.Fragment>
          {' '}
          {sortedIssues.map((issue: SecurityIssue) => {
            return (
              <SecurityItemDisplay
                key={issue.reference}
                open={isOpen(issue.reference)}
                packageUrl={purl}
                securityIssue={issue}
                remediationEvent={getRemediationAndOpen}
              />
            );
          })}
        </React.Fragment>
      );
    }
    return null;
  };

  return renderAccordion(nexusContext);
};

export default SecurityPage;
