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
import {NxButton, NxFontAwesomeIcon, NxH4, NxList} from '@sonatype/react-shared-components';
import {faCopy} from '@fortawesome/free-solid-svg-icons';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import React, {useContext} from 'react';
import {NexusContext, NexusContextInterface} from '../../../../../context/NexusContext';

const AdvancedLegalDisplay = (): JSX.Element => {
  const nexusContext = useContext(NexusContext);

  const copyToClipboard = (_event: any, text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderLegalDisplay = (nexusContext: NexusContextInterface | undefined) => {
    if (nexusContext && nexusContext.licenseDetails) {
      return (
        <React.Fragment>
          <div className="nx-grid-row">
            <section className="nx-grid-col nx-grid-col--100 nx-scrollable">
              <NxH4>Copy License Text</NxH4>
              <NxList>
                {nexusContext.licenseDetails.component.licenseLegalData.licenseFiles.map(
                  (licenses) => {
                    return (
                      <NxList.Item key={licenses.id}>
                        <NxList.Text>{licenses.relPath}</NxList.Text>
                        <NxList.Actions>
                          <NxButton
                            title="Copy License Text"
                            variant="icon-only"
                            onClick={(event) => copyToClipboard(event, licenses.content)}
                          >
                            <NxFontAwesomeIcon icon={faCopy as IconDefinition} />
                          </NxButton>
                        </NxList.Actions>
                      </NxList.Item>
                    );
                  }
                )}
              </NxList>
              <NxH4>Copyright Statements</NxH4>
              <NxList>
                {nexusContext.licenseDetails.component.licenseLegalData.copyrights.map(
                  (copyrights) => {
                    return (
                      <NxList.Item key={copyrights.originalContentHash}>
                        <NxList.Text>{copyrights.content}</NxList.Text>
                      </NxList.Item>
                    );
                  }
                )}
              </NxList>
            </section>
          </div>
        </React.Fragment>
      );
    }
    return null;
  };

  return renderLegalDisplay(nexusContext);
};

export default AdvancedLegalDisplay;
