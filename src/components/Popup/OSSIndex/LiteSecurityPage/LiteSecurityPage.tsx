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

// import { SecurityIssue } from '@sonatype/js-sona-types'
// import {
//     NxAccordion,
//     NxDescriptionList,
//     NxH2,
//     NxH3,
//     NxPolicyViolationIndicator,
//     NxStatefulAccordion,
//     NxTag,
//     NxTextLink,
//     ThreatLevelNumber,
// } from '@sonatype/react-shared-components'
// import * as React from 'react'
// import { useContext } from 'react'
// import { NexusContext, NexusContextInterface } from '../../../../context/ExtensionPopupContext'
// import { CvssVectorExplainer, VectorDetails } from '../../../../utils/CvssVectorExplainer'

// const LiteSecurityPage = (): JSX.Element | null => {
//     const nexusContext = useContext(NexusContext)

//     const renderSecurityItems = (nexusContext: NexusContextInterface | undefined): JSX.Element | null => {
//         if (
//             nexusContext &&
//             nexusContext.componentDetails &&
//             nexusContext.componentDetails.securityData // &&
//             // nexusContext.componentDetails.securityData.securityIssues
//         ) {
//             return (
//                 <div className='nx-grid-row'>
//                     <section className='nx-grid-col nx-grid-col--100 nx-scrollable'>
//                         {nexusContext.componentDetails.securityData.securityIssues.map((issue: SecurityIssue) => {
//                             const vectorExplained = CvssVectorExplainer(
//                                 issue.vector != null ? issue.vector.split('/') : []
//                             )
//                             return (
//                                 <NxStatefulAccordion key={issue.reference}>
//                                     <NxAccordion.Header>
//                                         <NxH2 className='nx-accordion__header-title'>{issue.reference}</NxH2>
//                                         <div className='nx-btn-bar'>
//                                             <NxPolicyViolationIndicator
//                                                 policyThreatLevel={Math.round(issue.severity) as ThreatLevelNumber}
//                                             />
//                                         </div>
//                                     </NxAccordion.Header>
//                                     <NxH3>
//                                         Learn more at{' '}
//                                         <NxTextLink external href={issue.url} target={`_new`}>
//                                             Sonatype OSS Index
//                                         </NxTextLink>
//                                     </NxH3>
//                                     <NxDescriptionList>
//                                         <NxDescriptionList.Item>
//                                             <NxDescriptionList.Term>Severity</NxDescriptionList.Term>
//                                             <NxDescriptionList.Description>
//                                                 <NxPolicyViolationIndicator
//                                                     policyThreatLevel={Math.round(issue.severity) as ThreatLevelNumber}>
//                                                     {issue.severity.toString()}
//                                                 </NxPolicyViolationIndicator>
//                                             </NxDescriptionList.Description>
//                                         </NxDescriptionList.Item>
//                                         <NxDescriptionList.Item>
//                                             <NxDescriptionList.Term>Description</NxDescriptionList.Term>
//                                             <NxDescriptionList.Description>
//                                                 {issue.description}
//                                             </NxDescriptionList.Description>
//                                         </NxDescriptionList.Item>
//                                         <NxDescriptionList.Item>
//                                             <NxDescriptionList.Term>CVSS Vector</NxDescriptionList.Term>
//                                             <NxDescriptionList.Description>
//                                                 <React.Fragment>
//                                                     {Array.from(vectorExplained).map(([key, value]) => {
//                                                         return (
//                                                             <NxTag
//                                                                 key={key}
//                                                                 color={(value as VectorDetails).color}>{`${key} - ${
//                                                                 (value as VectorDetails).quickExplanation
//                                                             } ${(value as VectorDetails).vector}`}</NxTag>
//                                                         )
//                                                     })}
//                                                 </React.Fragment>
//                                             </NxDescriptionList.Description>
//                                         </NxDescriptionList.Item>
//                                     </NxDescriptionList>
//                                 </NxStatefulAccordion>
//                             )
//                         })}
//                     </section>
//                 </div>
//             )
//         }
//         return null
//     }

//     return renderSecurityItems(nexusContext)
// }

// export default LiteSecurityPage
