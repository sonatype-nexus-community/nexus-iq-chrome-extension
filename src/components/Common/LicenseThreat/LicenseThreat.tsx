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
import React, {useContext} from 'react';
import {
  NxH3,
  NxPolicyViolationIndicator,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import {NexusContext, NexusContextInterface} from '../../../context/NexusContext';

const LicenseThreat = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderLicenseThreat = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext.licenseDetails &&
      nexusContext.licenseDetails.component &&
      nexusContext.licenseDetails.component.licenseLegalData
    ) {
      return getLicenseThreat(
        nexusContext.licenseDetails.component.licenseLegalData.highestEffectiveLicenseThreatGroup
          .licenseThreatGroupLevel,
        nexusContext.licenseDetails.component.licenseLegalData.highestEffectiveLicenseThreatGroup
          .licenseThreatGroupName
      );
    }
    return null;
  };

  const getLicenseThreat = (threatGroupLevel: number, threatGroupName: string) => {
    return (
      <React.Fragment>
        <NxH3>Max License Threat</NxH3>
        <NxPolicyViolationIndicator
          policyThreatLevel={Math.round(threatGroupLevel) as ThreatLevelNumber}
        >
          {threatGroupName}
        </NxPolicyViolationIndicator>
      </React.Fragment>
    );
  };

  return renderLicenseThreat(nexusContext);
};

export default LicenseThreat;