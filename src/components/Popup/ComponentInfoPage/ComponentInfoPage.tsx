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
import React, { useContext } from 'react';
import { NexusContext, NexusContextInterface } from '../../../context/NexusContext';
import { 
  NxTable, 
  NxTableHead, 
  NxTableRow, 
  NxTableCell, 
  NxTableBody } 
  from '@sonatype/react-shared-components';

const ComponentInfoPage = () => {

  const nexusContext = useContext(NexusContext);

  const formatDate = (date: string): string => {
    if (date) {
      var dateTime = new Date(date);
      return dateTime.toDateString();
    }
    return "Unknown";
  }

  const renderCIPPage = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext && nexusContext.componentDetails) {
      return <NxTable>
      <NxTableHead>
        <NxTableRow>
          <NxTableCell colSpan={2}>
            <h2>{ nexusContext.componentDetails.component.name }</h2>
          </NxTableCell>
        </NxTableRow>
      </NxTableHead>
      <NxTableBody>
        <NxTableRow>
          <NxTableCell>
            Package URL
          </NxTableCell>
          <NxTableCell>
            { nexusContext.componentDetails.component.packageUrl }
          </NxTableCell>
        </NxTableRow>
        <NxTableRow>
          <NxTableCell>
            Hash
          </NxTableCell>
          <NxTableCell>
            { nexusContext.componentDetails.component.hash }
          </NxTableCell>
        </NxTableRow>
        <NxTableRow>
          <NxTableCell>
            Version
          </NxTableCell>
          <NxTableCell>
            <span id="version">
              { nexusContext.componentDetails.component.componentIdentifier.coordinates.version }
            </span>
          </NxTableCell>
        </NxTableRow>
        <NxTableRow>
          <NxTableCell>
            Match State
          </NxTableCell>
          <NxTableCell>
            { nexusContext.componentDetails.matchState }
          </NxTableCell>
        </NxTableRow>
        <NxTableRow>
          <NxTableCell>
            Catalog Date
          </NxTableCell>
          <NxTableCell>
            <span id="catalogdate">
              { formatDate(nexusContext.componentDetails.catalogDate) }
            </span>
          </NxTableCell>
        </NxTableRow>
        <NxTableRow>
          <NxTableCell>
            Relative Popularity
          </NxTableCell>
          <NxTableCell>
            <span id="relativepopularity">
              { nexusContext.componentDetails.relativePopularity }
            </span>
          </NxTableCell>
        </NxTableRow>
      </NxTableBody>
    </NxTable>
    }
    return null;
  }

  return (
    renderCIPPage(nexusContext)
  )
}

export default ComponentInfoPage;
