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
import {
  ExtensionConfigurationContext,
  ExtensionPopupContext,
  NexusContext,
  NexusContextInterface
} from '../../../../context/NexusContext';
import {SecurityIssue, sortIssues} from '../../../../types/ArtifactMessage';
import {IqSecurityItemDisplay} from './SecurityItemDisplay/SecurityItemDisplay';
import './SecurityPage.css';
import {DATA_SOURCE} from "../../../../utils/Constants";
import {PackageURL} from "packageurl-js";
import {ApiSecurityIssueDTO} from "@sonatype/nexus-iq-api-client";

// type SecurityProps = object;

function IqSecurityPage() {
  const popupContext = useContext(ExtensionPopupContext)
  const [open, setOpen] = useState('');
  
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

      const purl = popupContext.currentPurl as PackageURL;
      const securityData = popupContext.iq?.componentDetails?.securityData
      // const sortedIssues: SecurityIssue[] = sortIssues(securityData.securityIssues);
      return (
        <React.Fragment>
          {' '}
          <div className="nx-grid-row">
            <section className="nx-grid-col nx-grid-col--100 nx-scrollable">
              {securityData?.securityIssues?.map((issue: ApiSecurityIssueDTO) => {
                return (
                  <IqSecurityItemDisplay
                    key={issue.reference}
                    open={isOpen(issue.reference as string)}
                    packageUrl={purl.toString()}
                    securityIssue={issue}
                    remediationEvent={getRemediationAndOpen}
                  />
                );
              })}
            </section>
          </div>
        </React.Fragment>
      )
}

export default function SecurityPage() {
  const extensionContext = useContext(ExtensionConfigurationContext)

  return (
      <div>
        {extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && (
            <IqSecurityPage/>
        )}
      </div>
  )
}
