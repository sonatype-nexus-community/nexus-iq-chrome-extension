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
    NxThreatIndicator,
    NxList,
    NxPolicyViolationIndicator,
    ThreatLevelNumber,
    NxTable,
} from '@sonatype/react-shared-components'
import * as React from 'react'
import { useContext } from 'react'
import {
    ExtensionConfigurationContext,
    ExtensionPopupContext,
    NexusContext,
    NexusContextInterface,
} from '../../../../../context/NexusContext'
import { SecurityIssue } from '../../../../../types/ArtifactMessage'
import '../SecurityPage.css'
import VulnDetails from './VulnDetails/VulnDetails'
import { ApiSecurityIssueDTO } from '@sonatype/nexus-iq-api-client'
import { DATA_SOURCE } from '../../../../../utils/Constants'
import { ConstraintViolation, Reason } from '@sonatype/js-sona-types'

type SecurityItemProps = {
    securityIssue: ApiSecurityIssueDTO
    open: boolean
    packageUrl: string
    remediationEvent: (vulnID: string) => void
    // threatLevelCategory:  "unspecified" | "none" | "low" | "moderate" | "severe" | "critical" | undefined;
}

export function IqSecurityItemDisplay(props: SecurityItemProps) {
    // const popupContext = useContext(ExtensionPopupContext)

    return (
        // <NxAccordion
        //   open={props.open}
        //   // onToggle={() => {
        //   //   props.remediationEvent(props.securityIssue.reference as string);
        //   //   if (nexusContext !== undefined && nexusContext.getVulnDetails !== undefined) {
        //   //     nexusContext.getVulnDetails(props.securityIssue.reference);
        //   //   }
        //   // }}
        // >
        <NxTable.Row isClickable className='nx-table-row'>
            <React.Fragment key={props.securityIssue.reference}>
                <NxTable.Cell className='nx-cell'>{props.securityIssue.severity}</NxTable.Cell>
                <NxTable.Cell className='nx-cell'>{props.securityIssue.reference}</NxTable.Cell>
            </React.Fragment>
        </NxTable.Row>
        // <NxList>
        //   <NxList.ButtonItem>
        //       <NxThreatIndicator threatLevelCategory={props.threatLevelCategory} presentational={false}/>
        //       <NxList.Text><span className="nx-threat-number">[ {props.securityIssue.severity} ]</span> {props.securityIssue.reference}</NxList.Text>
        //   </NxList.ButtonItem>
        // </NxList>
    )
    {
        /*<NxAccordion.Header>*/
    }
    {
        /*  <NxAccordion.Title>*/
    }
    {
        /*    /!*<NxAccordion.Title className="nx-accordion__header-title">*!/*/
    }
    {
        /*    {props.securityIssue.reference}*/
    }
    {
        /*  </NxAccordion.Title>*/
    }
    {
        /*<div className="nx-btn-bar">*/
    }
    {
        /*<NxPolicyViolationIndicator*/
    }
    {
        /*    style={{*/
    }
    {
        /*      width: '10px !important',*/
    }
    {
        /*      margin: 'none !important'*/
    }
    {
        /*    }}*/
    }
    {
        /*    policyThreatLevel={Math.round(props.securityIssue.severity) as ThreatLevelNumber}*/
    }
    {
        /*>*/
    }
    {
        /*  {props.securityIssue.severity.toString()}*/
    }
    {
        /*</NxPolicyViolationIndicator>*/
    }
    {
        /*<NxPolicyViolationIndicator*/
    }
    {
        /*  policyThreatLevel={Math.round(props.securityIssue.severity) as ThreatLevelNumber}*/
    }
    {
        /*/>*/
    }
    {
        /*</div>*/
    }
    {
        /*</NxAccordion.Header>*/
    }
    //   <p className="nx-p">
    //     {/*<VulnDetails />*/}
    //   </p>
    // </NxAccordion>
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
