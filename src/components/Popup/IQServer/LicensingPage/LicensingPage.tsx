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
import {NxButton, NxP, NxTextLink} from '@sonatype/react-shared-components';
import React, {useContext} from 'react';
import {
  ExtensionConfigurationContext,
  ExtensionPopupContext,
  NexusContext,
  NexusContextInterface
} from '../../../../context/NexusContext';
import {LicenseDetail} from '../../../../types/ArtifactMessage';
import LicenseThreat from '../../../Common/LicenseThreat/LicenseThreat';
import LicensingDisplay from './LicensingDisplay/LicensingDisplay';
import {DATA_SOURCE} from "../../../../utils/Constants";

function IqLicensePage () {
  const popupContext = useContext(ExtensionPopupContext)
  const licenseData = popupContext.iq?.componentDetails?.licenseData

    if (licenseData !== undefined) {
      // const licenseData = nexusContext.policyDetails.results[0].licenseData;
      const observedLicenses = licenseData?.observedLicenses?.filter(
        (license) => license.licenseId != 'Not-Supported'
      );
      return (
        <React.Fragment>
          <div className="nx-grid-row">
            <section className="nx-grid-col nx-grid-col--100 nx-scrollable">
              {/*Old Drawer Location*/}
            </section>
          </div>
          <div className="nx-grid-row">
            <section className="nx-grid-col nx-grid-col--67 nx-scrollable">
              <header className="nx-grid-header">
                <h3 className="nx-h3 nx-grid-header__title">Effective License(s)</h3>
              </header>
              {licenseData.effectiveLicenses?.map((license: LicenseDetail) => {
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
            <section className="nx-grid-col nx-grid-col--100">
              <NxP style={{textAlign: 'center'}}>
                {/*<NxButton id="nx-drawer-legal-open-button" onClick={nexusContext.toggleAlpDrawer}>*/}
                  <NxButton id="nx-drawer-legal-open-button" >
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
                    <span>A Sonatype Lifecycle Add-On</span>
                  </div>
                </h4>
                <span>
                  <img
                    src="/images/add-on-sonatype-icon-logoblue.png"
                    className="nx-popup-logo"
                    alt="Powered by Advanced Legal Pack"
                  />
                </span>
              </NxP>
            </section>
          </div>
        </React.Fragment>
      );
    } else {
      return (
          <React.Fragment>
            <p>No license information available.</p>
          </React.Fragment>
      )
    }
}

export default function LicensePage() {
  const extensionContext = useContext(ExtensionConfigurationContext)

  return (
      <div>
        {extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && (
            <IqLicensePage/>
        )}
      </div>
  )
}

