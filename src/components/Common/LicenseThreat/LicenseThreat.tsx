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
  NxLoadingSpinner,
  NxPolicyViolationIndicator,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import React, {useContext} from 'react';
import {NexusContext, NexusContextInterface} from '../../../context/NexusContext';

const LicenseThreat = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderLicenseThreat = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext && nexusContext.licenseDetails) {
      return getLicenseThreat(
        nexusContext.licenseDetails.component.licenseLegalData.highestEffectiveLicenseThreatGroup
          .licenseThreatGroupLevel,
        nexusContext.licenseDetails.component.licenseLegalData.highestEffectiveLicenseThreatGroup
          .licenseThreatGroupName
      );
    } else {
      return <NxLoadingSpinner />;
    }
    return null;
  };

  const getLicenseThreat = (threatGroupLevel: number, threatGroupName: string) => {
    return (
      <React.Fragment>
        <header className="nx-grid-header">
          <h3 className={'nx-h3 nx-grid-header__title'}>Max License Threat</h3>
        </header>
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
