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
  NxAccordion,
  NxPolicyViolationIndicator,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import * as React from 'react';
import {useContext} from 'react';
import {
  ExtensionConfigurationContext,
  ExtensionPopupContext,
  NexusContext,
  NexusContextInterface
} from '../../../../../context/NexusContext';
import {SecurityIssue} from '../../../../../types/ArtifactMessage';
import '../SecurityPage.css';
import VulnDetails from './VulnDetails/VulnDetails';
import {ApiSecurityIssueDTO} from "@sonatype/nexus-iq-api-client";
import {DATA_SOURCE} from "../../../../../utils/Constants";

type SecurityItemProps = {
  securityIssue: ApiSecurityIssueDTO;
  open: boolean;
  packageUrl: string;
  remediationEvent: (vulnID: string) => void;
};

export function IqSecurityItemDisplay(props: SecurityItemProps) {
  // const popupContext = useContext(ExtensionPopupContext)

      return (
        <NxAccordion
          open={props.open}
          // onToggle={() => {
          //   props.remediationEvent(props.securityIssue.reference);
          //   if (nexusContext !== undefined && nexusContext.getVulnDetails !== undefined) {
          //     nexusContext.getVulnDetails(props.securityIssue.reference);
          //   }
          // }}
        >
          <NxAccordion.Header>
            <NxAccordion.Title>
              {/*<NxAccordion.Title className="nx-accordion__header-title">*/}
              {props.securityIssue.reference}
            </NxAccordion.Title>
            {/*<div className="nx-btn-bar">*/}
            {/*<NxPolicyViolationIndicator*/}
            {/*    style={{*/}
            {/*      width: '10px !important',*/}
            {/*      margin: 'none !important'*/}
            {/*    }}*/}
            {/*    policyThreatLevel={Math.round(props.securityIssue.severity) as ThreatLevelNumber}*/}
            {/*>*/}
            {/*  {props.securityIssue.severity.toString()}*/}
            {/*</NxPolicyViolationIndicator>*/}
            {/*<NxPolicyViolationIndicator*/}
            {/*  policyThreatLevel={Math.round(props.securityIssue.severity) as ThreatLevelNumber}*/}
            {/*/>*/}
            {/*</div>*/}
          </NxAccordion.Header>
          <p className="nx-p">
            {/*<VulnDetails />*/}
          </p>
        </NxAccordion>
      )

}

// export default function SecurityItemDisplay() {
//   const extensionContext = useContext(ExtensionConfigurationContext)
//
//   return (
//       <div>
//         {extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && (
//             <IqSecurityItemDisplay/>
//         )}
//       </div>
//   )
// }
