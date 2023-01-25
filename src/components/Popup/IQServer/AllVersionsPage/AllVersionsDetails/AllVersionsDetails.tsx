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
import {
  ComponentContainer,
  ComponentDetails,
  SecurityData,
  VersionChange
} from '@sonatype/js-sona-types';
import {NxList, NxDescriptionList} from '@sonatype/react-shared-components';
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
      const allVersionsDetails: ComponentDetails[] = nexusContext.componentVersionsDetails;

      return (
        <NxList>
          {allVersionsDetails &&
            allVersionsDetails.map((componentDetail) => {
              const securityData: SecurityData = componentDetail.componentDetails[0].securityData;
              let maxSeverity = 0;
              if (securityData.securityIssues?.length > 0) {
                maxSeverity = Math.max(
                  ...securityData.securityIssues.map((issue) => issue.severity)
                );
              }
              const purl = PackageURL.fromString(
                componentDetail.componentDetails[0].component.packageUrl.toString()
              );

              return (
                <NxList.Item key={purl.version}>
                  [{maxSeverity}] {purl.version}
                </NxList.Item>
              );
            })}
        </NxList>
      );
    }
    return null;
  };

  return renderAllVersionsDetails(nexusContext);
};

export default AllVersionsDetails;
