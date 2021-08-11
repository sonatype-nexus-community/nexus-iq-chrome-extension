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
  NxTabs
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

type PopupProps = {
  getVulnDetails: (v: string) => Promise<void>;
  getLicenseDetails: (v: string) => Promise<void>;
  getRemediationDetails: (p: string) => Promise<void>;
};

const Popup = (props: PopupProps): JSX.Element | null => {
  const [activeTabId, setActiveTabId] = useState(0);

  const nexusContext = useContext(NexusContext);

  const renderPopup = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.policyDetails &&
      nexusContext.policyDetails.results &&
      nexusContext.policyDetails.results.length > 0 &&
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

      console.info('Rendering IQ Server View');

      return (
        <section className="nx-tile nx-viewport-sized__container">
          <header className="nx-tile-header">
            <div className="nx-tile-header__title">
              <h2 className="nx-h2">Sonatype Nexus Lifecycle Results</h2>
            </div>
          </header>
          <div className="nx-tile-content nx-viewport-sized__container">
            <NxTabs activeTab={activeTabId} onTabSelect={setActiveTabId}>
              <NxTabList>
                <NxTab>Info</NxTab>
                <NxTab>Remediation</NxTab>
                {hasSecurityIssues && <NxTab>Security</NxTab>}
                {hasViolations && <NxTab>Policy</NxTab>}
                <NxTab>Licensing</NxTab>
              </NxTabList>
              <NxTabPanel>
                <ComponentInfoPage
                  policyData={results.policyData}
                  securityData={results.securityData}
                  matchState={results.matchState}
                  purl={PackageURL.fromString(results.component.packageUrl)}
                  hash={results.component.hash}
                  catalogDate={results.catalogDate}
                ></ComponentInfoPage>
              </NxTabPanel>
              <NxTabPanel>
                <RemediationPage getRemediationDetails={props.getRemediationDetails} />
              </NxTabPanel>
              {hasSecurityIssues && (
                <NxTabPanel>
                  <SecurityPage getVulnDetails={props.getVulnDetails}></SecurityPage>
                </NxTabPanel>
              )}
              {hasViolations && (
                <NxTabPanel>
                  <PolicyPage></PolicyPage>
                </NxTabPanel>
              )}
              <NxTabPanel>
                <LicensingPage getLicenseDetails={props.getLicenseDetails}></LicensingPage>
              </NxTabPanel>
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
                <ComponentInfoPage
                  purl={purl}
                  description={nexusContext.componentDetails.component.description}
                  securityData={nexusContext.componentDetails.securityData}
                />
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
