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
import {NexusContext, NexusContextInterface} from '../../../../context/NexusContext';
import {
  NxTable,
  NxTableHead,
  NxTableRow,
  NxTableCell,
  NxTableBody
} from '@sonatype/react-shared-components';

const LiteComponentInfoPage = (): JSX.Element | null => {
  const nexusContext = useContext(NexusContext);

  const renderCIPPage = (nexusContext: NexusContextInterface | undefined): JSX.Element | null => {
    if (nexusContext && nexusContext.componentDetails) {
      return (
        <NxTable>
          <NxTableHead>
            <NxTableRow>
              <NxTableCell colSpan={2}>
                <h2>{nexusContext.componentDetails.component.packageUrl}</h2>
              </NxTableCell>
            </NxTableRow>
          </NxTableHead>
          <NxTableBody>
            <NxTableRow>
              <NxTableCell>Package URL</NxTableCell>
              <NxTableCell>{nexusContext.componentDetails.component.packageUrl}</NxTableCell>
            </NxTableRow>
          </NxTableBody>
        </NxTable>
      );
    }
    return null;
  };

  return renderCIPPage(nexusContext);
};

export default LiteComponentInfoPage;
