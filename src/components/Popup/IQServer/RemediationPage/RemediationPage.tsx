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

      return (
        <React.Fragment>
          <NxH3>Recommended Versions</NxH3>
          <RemediationDetails />
        </React.Fragment>
      );
    }

    return null;
  };

  return renderRemediationPage(nexusContext);
};

export default RemediationPage;
