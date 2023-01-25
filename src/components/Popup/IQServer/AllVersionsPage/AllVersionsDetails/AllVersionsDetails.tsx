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
import {ComponentContainer, ComponentDetails, VersionChange} from '@sonatype/js-sona-types';
import {NxList, NxDescriptionList} from '@sonatype/react-shared-components';
import React, {useContext} from 'react';
import {NexusContext, NexusContextInterface} from '../../../../../context/NexusContext';
import {REMEDIATION_LABELS} from '../../../../../utils/Constants';
import './AllVersionsDetails.css';
import {PackageURL} from 'packageurl-js';
import SecurityThreat from '../../../../Common/SecurityThreat/SecurityThreat';

const AllVersionsDetails = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderAllVersionsDetails = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext.componentVersions?.length > 0 &&
      nexusContext.componentVersionsDetails?.length > 0
    ) {
      // const versionChanges: VersionChange[] =
      //   nexusContext.remediationDetails.remediation.versionChanges;
      // const allVersions: string[] = nexusContext.componentVersions;
      const allVersionsDetails: ComponentDetails[] = nexusContext.componentVersionsDetails;

      console.log(`Details count: ${allVersionsDetails.length}`);
      console.log(allVersionsDetails);

      return (
        <NxList>
          {allVersionsDetails &&
            allVersionsDetails.map((componentDetail) => {
              const purl = PackageURL.fromString(
                componentDetail.componentDetails[0].component.packageUrl.toString()
              );
              return (
                <NxList.Item key={purl.version}>
                  {purl.version}
                  <SecurityThreat />
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
