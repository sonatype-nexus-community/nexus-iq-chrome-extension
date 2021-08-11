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
import {NxH4} from '@sonatype/react-shared-components';
import React, {useContext} from 'react';
import {NexusContext, NexusContextInterface} from '../../../../../context/NexusContext';

const AdvancedLegalDisplay = (): JSX.Element => {
  const nexusContext = useContext(NexusContext);

  const renderLegalDisplay = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext && nexusContext.licenseDetails) {
      return (
        <React.Fragment>
          <NxH4>License Files</NxH4>
          {nexusContext.licenseDetails.component.licenseLegalData.licenseFiles.map((licenses) => {
            return (
              <React.Fragment key={licenses.id}>
                <NxH4>{licenses.relPath}</NxH4>
                <blockquote className="nx-blockquote nx-truncate-ellipsis">
                  {licenses.content}
                </blockquote>
              </React.Fragment>
            );
          })}
          <NxH4>Copyright Statements</NxH4>
          {nexusContext.licenseDetails.component.licenseLegalData.copyrights.map((copyrights) => {
            return (
              <React.Fragment key={copyrights.id}>
                <NxH4>{copyrights.id}</NxH4>
                <blockquote className="nx-blockquote nx-truncate-ellipsis">
                  {copyrights.content}
                </blockquote>
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    }
    return null;
  };

  return renderLegalDisplay(nexusContext);
};

export default AdvancedLegalDisplay;
