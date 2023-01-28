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
import {NxDrawer, NxButton, NxP, NxTextLink} from '@sonatype/react-shared-components';
import {LicenseDetail} from '../../../../types/ArtifactMessage';
import {useToggle} from '@sonatype/react-shared-components';

const LicensingPage = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const [showDrawerLegal, toggleDrawerLegal] = useToggle(false);

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
          {/*TODO: To to render the drawer at the top level*/}
          <NxDrawer
            id="nx-drawer-legal"
            open={showDrawerLegal}
            onClose={toggleDrawerLegal}
            aria-labelledby="drawer-legal-title"
          >
            <NxDrawer.Header>
              <NxDrawer.HeaderTitle id="drawer-legal-title">License Files</NxDrawer.HeaderTitle>
            </NxDrawer.Header>
            <NxDrawer.Content tabIndex={0}>
              <AdvancedLegalDisplay />
            </NxDrawer.Content>
          </NxDrawer>
          <div className="nx-grid-row">
            <section className="nx-grid-col nx-grid-col--67 nx-scrollable">
              <header className="nx-grid-header">
                <h3 className="nx-h3 nx-grid-header__title">Effective License(s)</h3>
              </header>
              {licenseData.effectiveLicenses.map((license: LicenseDetail) => {
                return <LicensingDisplay key={license.licenseId} licenseData={license} />;
              })}
              {observedLicenses && observedLicenses.length > 0 && (
                <React.Fragment>
                  <header className="nx-grid-header">
                    <h3 className={'nx-h3 nx-grid-header__title'}>Observed License(s)</h3>
                  </header>
                  {observedLicenses.map((license: LicenseDetail) => {
                    return <LicensingDisplay key={license.licenseId} licenseData={license} />;
                  })}
                </React.Fragment>
              )}
            </section>
            <section className="nx-grid-col nx-grid-col--33 nx-scrollable">
              <LicenseThreat />
            </section>
          </div>
          <hr className="nx-grid-h-keyline" />
          <div className="nx-grid-row">
            <section className="nx-grid-col nx-grid-col--100 nx-scrollable">
              <NxP style={{textAlign: 'center'}}>
                <NxButton id="nx-drawer-legal-open-button" onClick={toggleDrawerLegal}>
                  <div>
                    <span>View License Files</span>
                  </div>
                </NxButton>
                <h4 className={'nx-h4'}>
                  <div>
                    Powered by{' '}
                    <NxTextLink
                      external
                      href="https://help.sonatype.com/iqserver/product-information/add-on-packs/advanced-legal-pack-quickstart"
                    >
                      Advanced Legal Pack
                    </NxTextLink>
                  </div>
                  <div>
                    <span>A Nexus Lifecycle Add-On</span>
                  </div>
                </h4>
                <span>
                  <img
                    src="/images/Lifecycle_add_on_icon@2x.png"
                    className="nx-popup-logo"
                    alt="Powered by Advanced Legal Pack"
                  />
                </span>
              </NxP>
            </section>
          </div>
        </React.Fragment>
      );
    }
    return null;
  };

  return renderLicensePage(nexusContext);
};

export default LicensingPage;
