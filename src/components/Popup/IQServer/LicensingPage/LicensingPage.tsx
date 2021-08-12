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
import LicensingDisplay from './LicensingDisplay/LicensingDisplay';
import AdvancedLegalDisplay from './AdvancedLegalDisplay/AdvancedLegalDisplay';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
import {
  NxList,
  NxH3,
  NxPolicyViolationIndicator,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import {LicenseDetail} from '../../../../types/ArtifactMessage';

const LicensingPage = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderLicensePage = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.policyDetails &&
      nexusContext.policyDetails.results &&
      nexusContext.policyDetails.results.length > 0 &&
      nexusContext.getLicenseDetails
    ) {
      nexusContext.getLicenseDetails(nexusContext.policyDetails.results[0].component.packageUrl);

      const licenseData = nexusContext.policyDetails.results[0].licenseData;
      const observedLicenses = licenseData.observedLicenses.filter(
        (license) => license.licenseId != 'Not-Supported'
      );
      return (
        <React.Fragment>
          <div className="nx-grid-row">
            <section className="nx-grid-col--75">
              <NxH3>Declared Licenses</NxH3>
              <NxList>
                {licenseData.declaredLicenses.map((license: LicenseDetail) => {
                  return <LicensingDisplay key={license.licenseId} licenseData={license} />;
                })}
              </NxList>
              {observedLicenses && observedLicenses.length > 0 && (
                <React.Fragment>
                  <NxH3>Observed Licenses</NxH3>
                  <NxList>
                    {observedLicenses.map((license: LicenseDetail) => {
                      return <LicensingDisplay key={license.licenseId} licenseData={license} />;
                    })}
                  </NxList>
                </React.Fragment>
              )}
            </section>
            <section className="nx-grid-col--25">
              {nexusContext.licenseDetails &&
                nexusContext.licenseDetails.component &&
                nexusContext.licenseDetails.component.licenseLegalData &&
                getLicenseThreat(
                  (
                    nexusContext.licenseDetails.component.licenseLegalData
                      .highestEffectiveLicenseThreatGroup as any
                  ).licenseThreatGroupLevel,
                  (
                    nexusContext.licenseDetails.component.licenseLegalData
                      .highestEffectiveLicenseThreatGroup as any
                  ).licenseThreatGroupName
                )}
            </section>
          </div>
          <AdvancedLegalDisplay />
        </React.Fragment>
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

  return renderLicensePage(nexusContext);
};

export default LicensingPage;
