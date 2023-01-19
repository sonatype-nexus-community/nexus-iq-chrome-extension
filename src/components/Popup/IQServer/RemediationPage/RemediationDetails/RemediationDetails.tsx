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
import {VersionChange} from '@sonatype/js-sona-types';
import {NxList, NxDescriptionList} from '@sonatype/react-shared-components';
import React, {useContext} from 'react';
import {NexusContext, NexusContextInterface} from '../../../../../context/NexusContext';
import {REMEDIATION_LABELS} from '../../../../../utils/Constants';
import './RemediationDetails.css';

const RemediationDetails = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderRemediationDetails = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.remediationDetails &&
      nexusContext.remediationDetails.remediation &&
      nexusContext.remediationDetails.remediation.versionChanges &&
      nexusContext.remediationDetails.remediation.versionChanges.length > 0
    ) {
      const versionChanges: VersionChange[] =
        nexusContext.remediationDetails.remediation.versionChanges;

      return (
        <NxDescriptionList>
          {versionChanges &&
            versionChanges.map((change) => {
              return (
                <NxDescriptionList.Item key={change.type}>
                  <NxDescriptionList.Term className={'nx-list__term__remediation'}>
                    {REMEDIATION_LABELS[change.type]}
                  </NxDescriptionList.Term>
                  <NxDescriptionList.Description>
                    {change.data.component.componentIdentifier.coordinates.version}
                  </NxDescriptionList.Description>
                </NxDescriptionList.Item>
              );
            })}
        </NxDescriptionList>
      );
    }
    return null;
  };

  return renderRemediationDetails(nexusContext);
};

export default RemediationDetails;
