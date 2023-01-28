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
  NxList,
  NxP,
  NxPolicyViolationIndicator,
  ThreatLevelNumber,
  NxDescriptionList,
  NxGrid,
  NxH2
} from '@sonatype/react-shared-components';
import {PolicyData, SecurityData} from '@sonatype/js-sona-types';
import {PackageURL} from 'packageurl-js';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
import LicenseThreat from '../../../Common/LicenseThreat/LicenseThreat';
import SecurityThreat from '../../../Common/SecurityThreat/SecurityThreat';
import {DATA_SOURCES} from '../../../../utils/Constants';
import './ComponentInfoPage.css';

// type ComponentInfoPageProps = {
//   purl: PackageURL;
//   description?: string;
//   catalogDate?: Date;
//   matchState?: string;
//   policyData?: PolicyData;
//   hash?: string;
// };

const ComponentInfoPage = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const formatDate = (date: Date | undefined | null): string => {
    if (date) {
      const dateTime = new Date(date);
      return dateTime.toISOString();
    }
    return 'N/A';
  };

  // TODO: Give the correct coordinate labels based on package type
  const renderCIPPage = (nexusContext: NexusContextInterface | undefined) => {
    // if (nexusContext && nexusContext.getLicenseDetails && !nexusContext.licenseDetails) {
    //   nexusContext.getLicenseDetails(props.purl.toString());
    // }
    if (nexusContext.componentDetails?.component) {
      return (
        <React.Fragment>
          <NxGrid.Row>
            <section className="nx-grid-col nx-grid-col--67 nx-scrollable">
              <header className="nx-grid-header">
                <h3 className="nx-h3 nx-grid-header__title">
                  {nexusContext.componentDetails.component.displayName}
                </h3>
              </header>
              {nexusContext.componentDetails.component.description && (
                <NxP>{nexusContext.componentDetails.component.description}</NxP>
              )}
              <NxDescriptionList>
                {nexusContext.componentDetails.projectData?.projectMetadata.organization && (
                  <NxDescriptionList.Item>
                    <NxDescriptionList.Term>Project</NxDescriptionList.Term>
                    <NxDescriptionList.Description>
                      {nexusContext.componentDetails.projectData?.projectMetadata.organization}
                    </NxDescriptionList.Description>
                  </NxDescriptionList.Item>
                )}
                {nexusContext.componentDetails.projectData?.projectMetadata.description && (
                  <NxDescriptionList.Item>
                    <NxDescriptionList.Term>Description</NxDescriptionList.Term>
                    <NxDescriptionList.Description>
                      {nexusContext.componentDetails.projectData?.projectMetadata.description}
                    </NxDescriptionList.Description>
                  </NxDescriptionList.Item>
                )}
                {nexusContext.componentDetails.projectData?.lastReleaseDate && (
                  <NxDescriptionList.Item>
                    <NxDescriptionList.Term>Last Release Date</NxDescriptionList.Term>
                    <NxDescriptionList.Description>
                      {nexusContext.componentDetails.projectData?.lastReleaseDate}
                    </NxDescriptionList.Description>
                  </NxDescriptionList.Item>
                )}
                {nexusContext.componentDetails.projectData?.firstReleaseDate && (
                  <NxDescriptionList.Item>
                    <NxDescriptionList.Term>First Release Date</NxDescriptionList.Term>
                    <NxDescriptionList.Description>
                      {nexusContext.componentDetails.projectData?.firstReleaseDate}
                    </NxDescriptionList.Description>
                  </NxDescriptionList.Item>
                )}
                {nexusContext.componentDetails.catalogDate && (
                  <NxDescriptionList.Item>
                    <NxDescriptionList.Term>Catalog Date</NxDescriptionList.Term>
                    <NxDescriptionList.Description>
                      {nexusContext.componentDetails.catalogDate}
                    </NxDescriptionList.Description>
                  </NxDescriptionList.Item>
                )}
                {nexusContext.componentDetails.component.hash && (
                  <NxDescriptionList.Item>
                    <NxDescriptionList.Term>Hash</NxDescriptionList.Term>
                    <NxDescriptionList.Description>
                      {nexusContext.componentDetails.component.hash}
                    </NxDescriptionList.Description>
                  </NxDescriptionList.Item>
                )}
              </NxDescriptionList>
            </section>
            <section className="nx-grid-col nx-grid-col--33">
              {/*<p className="nx-p">*/}
              {nexusContext.policyDetails.results[0] &&
                getPolicyViolationIndicator(nexusContext.policyDetails.results[0].policyData)}
              <SecurityThreat />
              {nexusContext &&
                nexusContext.licenseDetails &&
                nexusContext.scanType === DATA_SOURCES.NEXUSIQ && <LicenseThreat />}
              {/*</p>*/}
            </section>
          </NxGrid.Row>
        </React.Fragment>
      );
    } else {
      return null;
    }
  };

  const getPolicyViolationIndicator = (policyData: PolicyData | undefined): JSX.Element | null => {
    if (policyData && policyData.policyViolations && policyData.policyViolations.length > 0) {
      const maxViolation = Math.max(
        ...policyData.policyViolations.map((violation) => violation.threatLevel)
      );
      return (
        <React.Fragment>
          <header className="nx-grid-header">
            <h3 className={'nx-h3'}>Max Policy Violation</h3>
          </header>
          <NxPolicyViolationIndicator
            style={{marginBottom: '16px !important'}}
            policyThreatLevel={Math.round(maxViolation) as ThreatLevelNumber}
          ></NxPolicyViolationIndicator>
        </React.Fragment>
      );
    }
    if (policyData && policyData.policyViolations && policyData.policyViolations.length == 0) {
      return (
        <React.Fragment>
          <h3 className={'nx-h3'}>No Policy Violations</h3>
          <NxPolicyViolationIndicator
            style={{marginBottom: '16px !important'}}
            threatLevelCategory="none"
          >
            Woohoo!
          </NxPolicyViolationIndicator>
        </React.Fragment>
      );
    }
    return null;
  };

  return renderCIPPage(nexusContext);
};

export default ComponentInfoPage;
