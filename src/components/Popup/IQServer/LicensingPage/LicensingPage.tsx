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
  NxTable,
  NxTableHead,
  NxTableRow,
  NxTableCell,
  NxTableBody
} from '@sonatype/react-shared-components';
import {LicenseDetail} from '../../../../types/ArtifactMessage';

type LicensingPageProps = {
  getLicenseDetails: (p: string) => Promise<void>;
};

const LicensingPage = (props: LicensingPageProps): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderLicensePage = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.policyDetails &&
      nexusContext.policyDetails.results &&
      nexusContext.policyDetails.results.length > 0
    ) {
      props.getLicenseDetails(nexusContext.policyDetails.results[0].component.packageUrl);

      const licenseData = nexusContext.policyDetails.results[0].licenseData;
      return (
        <React.Fragment>
          <NxTable>
            <NxTableHead>
              <NxTableRow>
                <NxTableCell colSpan={2}>Declared Licenses</NxTableCell>
              </NxTableRow>
            </NxTableHead>
            <NxTableBody>
              {licenseData.declaredLicenses.map((license: LicenseDetail) => {
                return <LicensingDisplay key={license.licenseId} licenseData={license} />;
              })}
            </NxTableBody>
          </NxTable>
          <NxTable>
            <NxTableHead>
              <NxTableRow>
                <NxTableCell colSpan={2}>Observed Licenses</NxTableCell>
              </NxTableRow>
            </NxTableHead>
            <NxTableBody>
              {licenseData.observedLicenses.map((license: LicenseDetail) => {
                return <LicensingDisplay key={license.licenseId} licenseData={license} />;
              })}
            </NxTableBody>
          </NxTable>
          <AdvancedLegalDisplay />
        </React.Fragment>
      );
    }
    return null;
  };

  return renderLicensePage(nexusContext);
};

export default LicensingPage;
