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
import LicenseThreat from '../../../Common/LicenseThreat/LicenseThreat';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
import {NxList, NxDescriptionList} from '@sonatype/react-shared-components';
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
      const licenseData = nexusContext.policyDetails.results[0].licenseData;
      const observedLicenses = licenseData.observedLicenses.filter(
        (license) => license.licenseId != 'Not-Supported'
      );
      return (
        <React.Fragment>
          <section className="nx-tile nx-viewport-sized__container">
            <div className="nx-grid-row">
              <section className="nx-grid-col--75 nx-scrollable">
                <h3 className={'nx-h3'}>Effective License(s)</h3>
                {licenseData.effectiveLicenses.map((license: LicenseDetail) => {
                  return <LicensingDisplay key={license.licenseId} licenseData={license} />;
                })}
                {observedLicenses && observedLicenses.length > 0 && (
                  <React.Fragment>
                    <h3 className={'nx-h3'}>Observed Licenses</h3>
                    {observedLicenses.map((license: LicenseDetail) => {
                      return <LicensingDisplay key={license.licenseId} licenseData={license} />;
                    })}
                  </React.Fragment>
                )}
              </section>
              <section className="nx-grid-col--25">
                <LicenseThreat />
              </section>
            </div>
            <AdvancedLegalDisplay />
          </section>
        </React.Fragment>
      );
    }
    return null;
  };

  return renderLicensePage(nexusContext);
};

export default LicensingPage;
