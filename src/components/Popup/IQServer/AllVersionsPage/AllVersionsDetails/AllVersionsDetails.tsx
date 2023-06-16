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
import {ComponentContainer, SecurityData} from '@sonatype/js-sona-types';
import {
  NxList,
  NxLoadingSpinner,
  NxPolicyViolationIndicator,
  ThreatLevelNumber
} from '@sonatype/react-shared-components';
import {PackageURL} from 'packageurl-js';
import React, {useContext, useEffect, useRef} from 'react';
import {
  ExtensionConfigurationContext,
  ExtensionPopupContext,
  NexusContext,
  NexusContextInterface
} from '../../../../../context/NexusContext';
import './AllVersionsDetails.css';
import {DATA_SOURCE} from "../../../../../utils/Constants";

function IqAllVersionDetails() {
  const popupContext = useContext(ExtensionPopupContext)
  const allVersions = popupContext.iq?.allVersions
  const currentVersionRef = useRef<HTMLElement>(null);

  // useEffect(() => {
  //   if (
  //     nexusContext.componentVersionsDetails &&
  //     nexusContext.componentVersionsDetails.length > 0 &&
  //     currentVersionRef.current
  //   ) {
  //     console.log(currentVersionRef.current);
  //     currentVersionRef.current.scrollIntoView({
  //       behavior: 'smooth',
  //       block: 'center',
  //       inline: 'nearest'
  //     });
  //   }
  // })
    if (allVersions && popupContext.currentPurl) {
      return (
        <NxList>
          {allVersions.map((version) => {
            // const securityData: SecurityData | null = componentDetail.securityData
            //   ? componentDetail.securityData
            //   : null;
            // let maxSeverity = 0;
            // if (securityData && securityData.securityIssues?.length > 0) {
            //   maxSeverity = Math.max(...securityData.securityIssues.map((issue) => issue.severity));
            // }
            // const purl = PackageURL.fromString(componentDetail.component.packageUrl.toString());
            const purl = popupContext.currentPurl
            if (purl) {
              purl.version = version
            }


            return (
              <NxList.LinkItem
                href=""
                key={purl?.version}
                selected={popupContext.currentPurl && purl?.version == popupContext.currentPurl.version}
              >
                <NxList.Text
                  ref={
                    popupContext.currentPurl && purl?.version == popupContext.currentPurl.version ? currentVersionRef : null
                  }
                >
                  {purl?.version}

                  {/*<NxPolicyViolationIndicator*/}
                  {/*  style={{float: 'right', width: '100px !important'}}*/}
                  {/*  policyThreatLevel={Math.round(maxSeverity) as ThreatLevelNumber}*/}
                  {/*>*/}
                  {/*  {' ' + purl.version}*/}
                  {/*</NxPolicyViolationIndicator>*/}
                </NxList.Text>
              </NxList.LinkItem>
            );
          })}
        </NxList>
      );
    } else {
      return <NxLoadingSpinner />;
    }
}

export default function AllVersionDetails() {
  const extensionContext = useContext(ExtensionConfigurationContext)

  return (
      <div>
        {extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && (
            <IqAllVersionDetails/>
        )}
      </div>
  )
}

