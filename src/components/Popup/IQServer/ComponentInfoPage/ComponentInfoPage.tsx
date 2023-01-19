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
  NxGrid
} from '@sonatype/react-shared-components';
import {PolicyData, SecurityData} from '@sonatype/js-sona-types';
import {PackageURL} from 'packageurl-js';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
import LicenseThreat from '../../../Common/LicenseThreat/LicenseThreat';
import SecurityThreat from '../../../Common/SecurityThreat/SecurityThreat';
import {DATA_SOURCES} from '../../../../utils/Constants';
import './ComponentInfoPage.css';

type ComponentInfoPageProps = {
  purl: PackageURL;
  description?: string;
  catalogDate?: Date;
  matchState?: string;
  policyData?: PolicyData;
  hash?: string;
};

const ComponentInfoPage = (props: ComponentInfoPageProps): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const formatDate = (date: Date | undefined | null): string => {
    if (date) {
      const dateTime = new Date(date);
      return dateTime.toISOString();
    }
    return 'N/A';
  };

  const renderCIPPage = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext && nexusContext.getLicenseDetails && !nexusContext.licenseDetails) {
      nexusContext.getLicenseDetails(props.purl.toString());
    }
    return (
      <React.Fragment>
        <NxGrid.Row>
          <section className="nx-grid-col nx-grid-col--67 nx-scrollable">
            <header className="nx-grid-header">
              <h3 className="nx-h3 nx-grid-header__title">{props.purl.name}</h3>
            </header>
            {/*<NxH2>{props.purl.toString()}</NxH2>*/}
            {props.description && <NxP>{props.description}</NxP>}
            <NxDescriptionList>
              {props.purl.namespace && (
                <NxDescriptionList.Item>
                  <NxList.DescriptionTerm>Namespace</NxList.DescriptionTerm>
                  <NxList.Description>{props.purl.namespace}</NxList.Description>
                </NxDescriptionList.Item>
              )}
              <NxDescriptionList.Item>
                <NxDescriptionList.Term>Name</NxDescriptionList.Term>
                <NxDescriptionList.Description>{props.purl.name}</NxDescriptionList.Description>
              </NxDescriptionList.Item>
              <NxDescriptionList.Item>
                <NxDescriptionList.Term>Version</NxDescriptionList.Term>
                <NxDescriptionList.Description>{props.purl.version}</NxDescriptionList.Description>
              </NxDescriptionList.Item>
              {/*{props.matchState && (*/}
              {/*  <NxDescriptionList.Item>*/}
              {/*    <NxList.DescriptionTerm>Match State</NxList.DescriptionTerm>*/}
              {/*    <NxList.Description>{props.matchState}</NxList.Description>*/}
              {/*  </NxDescriptionList.Item>*/}
              {/*)}*/}
              {props.catalogDate && (
                <NxDescriptionList.Item>
                  <NxDescriptionList.Term>Catalog Date</NxDescriptionList.Term>
                  <NxDescriptionList.Description>
                    {formatDate(props.catalogDate)}
                  </NxDescriptionList.Description>
                </NxDescriptionList.Item>
              )}
              {props.hash && (
                <NxDescriptionList.Item>
                  <NxDescriptionList.Term>Hash</NxDescriptionList.Term>
                  <NxDescriptionList.Description>{props.hash}</NxDescriptionList.Description>
                </NxDescriptionList.Item>
              )}
            </NxDescriptionList>
          </section>
          <section className="nx-grid-col nx-grid-col--33">
            <p className="nx-p">
              {props.policyData && getPolicyViolationIndicator(props.policyData)}
              <SecurityThreat />
              {nexusContext &&
                nexusContext.licenseDetails &&
                nexusContext.scanType === DATA_SOURCES.NEXUSIQ && <LicenseThreat />}
            </p>
          </section>
        </NxGrid.Row>
      </React.Fragment>
    );
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
            policyThreatLevel={Math.round(maxViolation) as ThreatLevelNumber}
          ></NxPolicyViolationIndicator>
        </React.Fragment>
      );
    }
    if (policyData && policyData.policyViolations && policyData.policyViolations.length == 0) {
      return (
        <React.Fragment>
          <h3 className={'nx-h3'}>No Policy Violations</h3>
          <NxPolicyViolationIndicator threatLevelCategory="none">
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
