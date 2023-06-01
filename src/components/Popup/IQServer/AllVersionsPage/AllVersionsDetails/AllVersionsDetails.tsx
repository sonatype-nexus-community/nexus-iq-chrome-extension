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
import {ComponentContainer, SecurityData} from '@sonatype/js-sona-types';
import {
  NxList,
  NxLoadingSpinner,
  NxPolicyViolationIndicator,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import {PackageURL} from 'packageurl-js';
import React, {useContext, useEffect, useRef} from 'react';
import {NexusContext, NexusContextInterface} from '../../../../../context/NexusContext';
import './AllVersionsDetails.css';

const AllVersionsDetails = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const currentVersionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (
      nexusContext.componentVersionsDetails &&
      nexusContext.componentVersionsDetails.length > 0 &&
      currentVersionRef.current
    ) {
      console.log(currentVersionRef.current);
      currentVersionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  });

  const renderAllVersionsDetails = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.componentVersionsDetails &&
      nexusContext.componentVersionsDetails.length > 0
    ) {
      const allVersionsDetails: ComponentContainer[] = nexusContext.componentVersionsDetails;
      const currentPurl = nexusContext.currentComponentPurl;

      return (
        <NxList>
          {allVersionsDetails.map((componentDetail) => {
            const securityData: SecurityData | null = componentDetail.securityData
              ? componentDetail.securityData
              : null;
            let maxSeverity = 0;
            if (securityData && securityData.securityIssues?.length > 0) {
              maxSeverity = Math.max(...securityData.securityIssues.map((issue) => issue.severity));
            }
            const purl = PackageURL.fromString(componentDetail.component.packageUrl.toString());

            return (
              <NxList.LinkItem
                href=""
                key={purl.version}
                selected={currentPurl && purl.version == currentPurl.version}
              >
                <NxList.Text
                  ref={
                    currentPurl && purl.version == currentPurl.version ? currentVersionRef : null
                  }
                >
                  {/*{purl.version}*/}

                  <NxPolicyViolationIndicator
                    style={{float: 'right', width: '100px !important'}}
                    policyThreatLevel={Math.round(maxSeverity) as ThreatLevelNumber}
                  >
                    {' ' + purl.version}
                  </NxPolicyViolationIndicator>
                </NxList.Text>
              </NxList.LinkItem>
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
