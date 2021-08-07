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
import {NxPolicyViolationIndicator} from '@sonatype/react-shared-components';
import React, {useContext} from 'react';
import {NexusContext, NexusContextInterface} from '../../../../../context/NexusContext';

const AdvancedLegalDisplay = (): JSX.Element => {
  const nexusContext = useContext(NexusContext);

  const renderLegalDisplay = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext && nexusContext.licenseDetails) {
      const threatGroup = nexusContext.licenseDetails.component.licenseLegalData
        .highestEffectiveLicenseThreatGroup as any;
      return (
        <React.Fragment>
          <h2>Advanced Legal Pack details</h2>
          <NxPolicyViolationIndicator
            policyThreatLevel={threatGroup.licenseThreatGroupLevel}
            threatLevelCategory={threatGroup.licenseThreatGroupName}
          />
          <h3>License Texts</h3>
          {nexusContext.licenseDetails.component.licenseLegalData.licenseFiles.map((licenses) => {
            return (
              <React.Fragment key={licenses.id}>
                <h4>{licenses.relPath}</h4>
                <blockquote className="nx-blockquote nx-truncate-ellipsis">
                  {licenses.content}
                </blockquote>
              </React.Fragment>
            );
          })}
          <h3>Copyright Statements</h3>
          {nexusContext.licenseDetails.component.licenseLegalData.copyrights.map((copyrights) => {
            return (
              <React.Fragment key={copyrights.id}>
                <h4>{copyrights.id}</h4>
                <blockquote className="nx-blockquote nx-truncate-ellipsis">
                  {copyrights.content}
                </blockquote>
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    }
    return null;
  };

  return renderLegalDisplay(nexusContext);
};

export default AdvancedLegalDisplay;
