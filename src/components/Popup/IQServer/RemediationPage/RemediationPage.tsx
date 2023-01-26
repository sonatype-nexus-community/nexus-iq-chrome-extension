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
import {NxH3} from '@sonatype/react-shared-components';
import React from 'react';
import {useContext} from 'react';
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
import RemediationDetails from './RemediationDetails/RemediationDetails';
import AllVersionsDetails from '../AllVersionsPage/AllVersionsDetails/AllVersionsDetails';
import {ComponentContainer, ComponentDetails} from '@sonatype/js-sona-types';

const RemediationPage = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderRemediationPage = (nexusContext: NexusContextInterface | undefined) => {
    if (
      nexusContext &&
      nexusContext.policyDetails &&
      nexusContext.policyDetails.results &&
      nexusContext.policyDetails.results.length > 0 &&
      nexusContext.getRemediationDetails
    ) {
      if (!nexusContext.remediationDetails) {
        nexusContext.getRemediationDetails(
          nexusContext.policyDetails.results[0].component.packageUrl
        );
      }
      const allVersionsDetails: ComponentContainer[] = nexusContext.componentVersionsDetails;

      return (
        <React.Fragment>
          <div className="nx-grid-row">
            <section className="nx-grid-col nx-grid-col--67 nx-scrollable">
              <NxH3>Recommended Versions</NxH3>
              <RemediationDetails />
            </section>
            <section className="nx-grid-col nx-grid-col--33 nx-scrollable">
              <NxH3>All Versions ({allVersionsDetails?.length})</NxH3>
              <AllVersionsDetails />
            </section>
          </div>
        </React.Fragment>
      );
    }

    return null;
  };

  return renderRemediationPage(nexusContext);
};

export default RemediationPage;
