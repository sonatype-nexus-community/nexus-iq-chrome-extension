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
  NxStatefulErrorAlert,
  NxTab,
  NxTabList,
  NxTabPanel,
  NxTabs,
  NxPageMain,
  NxFontAwesomeIcon
} from '@sonatype/react-shared-components';
import ComponentInfoPage from './IQServer/ComponentInfoPage/ComponentInfoPage';
import LicensingPage from './IQServer/LicensingPage/LicensingPage';
import SecurityPage from './IQServer/SecurityPage/SecurityPage';
import RemediationPage from './IQServer/RemediationPage/RemediationPage';
import React, {useContext, useState} from 'react';
import {NexusContext, NexusContextInterface} from '../../context/NexusContext';
import {DATA_SOURCES} from '../../utils/Constants';
import LiteSecurityPage from './OSSIndex/LiteSecurityPage/LiteSecurityPage';
import {Puff} from '@agney/react-loading';
import './Popup.css';
import PolicyPage from './IQServer/PolicyPage/PolicyPage';
import {PackageURL} from 'packageurl-js';
import {
  faAngry,
  faExternalLinkAlt,
  faExternalLinkSquareAlt
} from '@fortawesome/free-solid-svg-icons';

import AllVersionsPage from './IQServer/AllVersionsPage/AllVersionsPage';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';

const Popup = (): JSX.Element | null => {
  const [activeTabId, setActiveTabId] = useState(0);

  const nexusContext = useContext(NexusContext);

  const renderPopup = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.policyDetails &&
      nexusContext.policyDetails.results &&
      nexusContext.policyDetails.results?.length > 0 &&
      nexusContext.scanType === DATA_SOURCES.NEXUSIQ
    ) {
      const results = nexusContext.policyDetails.results[0];
      const hasViolations =
        results.policyData &&
        results.policyData.policyViolations &&
        results.policyData.policyViolations.length > 0;
      const hasSecurityIssues =
        results.securityData &&
        results.securityData.securityIssues &&
        results.securityData.securityIssues.length > 0;
      const hasLegalResults = results.licenseData.effectiveLicenses?.length > 0;

      console.info('Rendering IQ Server View');

      return (
        <section className="nx-tile nx-viewport-sized__container">
          <header className="nx-tile-header">
            <div className="nx-tile-header__title">
              <h2 className="nx-h2">
                <img
                  src="/images/NexusLifecycle_Icon_Square_Outlined.png"
                  className="nx-popup-logo"
                  alt="Sonatype Nexus Lifecycle"
                />
                &nbsp;Sonatype Nexus Lifecycle Results
              </h2>
            </div>
          </header>
          <div className="nx-tile-subsection nx-viewport-sized__container">
            <NxTabs activeTab={activeTabId} onTabSelect={setActiveTabId}>
              <NxTabList>
                <NxTab>Info</NxTab>
                {hasViolations && <NxTab>Remediation</NxTab>}
                {hasViolations && (
                  <NxTab>
                    Policy
                    <span className={'nx-counter'}>
                      {results.policyData.policyViolations.length}
                    </span>
                  </NxTab>
                )}
                {hasSecurityIssues && (
                  <NxTab>
                    Security
                    <span className={'nx-counter'}>
                      {results.securityData.securityIssues.length}
                    </span>
                  </NxTab>
                )}
                {hasLegalResults && <NxTab>Legal</NxTab>}
              </NxTabList>
              <NxTabPanel>
                <ComponentInfoPage />
              </NxTabPanel>
              <NxTabPanel>{hasViolations && <RemediationPage />}</NxTabPanel>
              {hasViolations && (
                <NxTabPanel>
                  <PolicyPage />
                </NxTabPanel>
              )}
              {hasSecurityIssues && (
                <NxTabPanel>
                  <SecurityPage />
                </NxTabPanel>
              )}
              <NxTabPanel>{hasLegalResults && <LicensingPage />}</NxTabPanel>
            </NxTabs>
          </div>
        </section>
      );
    } else if (
      nexusContext &&
      nexusContext.componentDetails &&
      nexusContext.scanType === DATA_SOURCES.OSSINDEX
    ) {
      const purl = PackageURL.fromString(nexusContext.componentDetails.component.packageUrl);
      const hasVulns =
        nexusContext.componentDetails.securityData &&
        nexusContext.componentDetails.securityData.securityIssues &&
        nexusContext.componentDetails.securityData.securityIssues.length > 0;
      console.info('Rendering OSS Index View');
      return (
        <section className="nx-tile nx-viewport-sized__container">
          <header className="nx-tile-header">
            <div className="nx-tile-header__title">
              <h2 className="nx-h2">Sonatype OSS Index Results</h2>
            </div>
          </header>
          <div className="nx-tile-content nx-viewport-sized__container">
            <NxTabs activeTab={activeTabId} onTabSelect={setActiveTabId}>
              <NxTabList>
                <NxTab>Info</NxTab>
                {hasVulns && <NxTab>Security</NxTab>}
              </NxTabList>
              <NxTabPanel>
                <ComponentInfoPage />
              </NxTabPanel>
              {hasVulns && (
                <NxTabPanel>
                  <LiteSecurityPage></LiteSecurityPage>
                </NxTabPanel>
              )}
            </NxTabs>
          </div>
        </section>
      );
    }
    if (nexusContext && nexusContext.errorMessage) {
      return <NxStatefulErrorAlert>{nexusContext.errorMessage}</NxStatefulErrorAlert>;
    }
    return <Puff />;
  };

  return renderPopup(nexusContext);
};

export default Popup;
