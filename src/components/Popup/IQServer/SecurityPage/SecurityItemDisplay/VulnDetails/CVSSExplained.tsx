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
import React  from 'react';
import {CvssVectorExplainer} from '../../../../../../utils/CvssVectorExplainer';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import {
  
  NxTable,
  NxFontAwesomeIcon,
  NxH3,
  NxTooltip
} from '@sonatype/react-shared-components';


const CVSSExplained = ({ vector }): JSX.Element | null => {
  function getByValue(map, searchValue) {
    // console.log("getByValue", map, searchValue);
    for (const [key, value] of map.entries()) {
      if (key === searchValue) return value;
    }
  }
  
  const renderCVSS = (vector) => {    
    const cvssElements = vector.split('/');
    const elements = CvssVectorExplainer(cvssElements);
    console.log('vector', vector, cvssElements, elements);
    
    return (
      <React.Fragment>
        <div className="nx-vulnerability-details">
          <div className="nx-grid-row">
            <div className="nx-grid-col">
              <dl className={'nx-read-only'}>
                <dt></dt>
                <dd>
                  <span>{'\xa0'.repeat(29)}</span>
                </dd>
              </dl>
            </div>

            <div className="nx-grid-col">
              <NxTable>
                <NxTable.Head>
                  <NxH3>CVSS Explained</NxH3>
                </NxTable.Head>
                <NxTable.Body>
                  <NxTable.Row key="AC" clickAccessibleLabel={getByValue(elements, 'AC').tooltip}>
                    <NxTable.Cell>Attack Complexity:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'AC').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      {/* according to this document icon-only should generate a tool tip https://gallery.sonatype.dev/#/pages/Button */}
                      {/* not working at the moment and it's a bit of react magic which I can't work out */}
                      <NxTooltip
                        title={getByValue(elements, 'AC').tooltip}
                        placement="top"
                        className={''}
                      >
                        <NxFontAwesomeIcon
                          icon={faQuestionCircle as IconDefinition}
                          color="rgb(4, 89, 200)"
                        />
                      </NxTooltip>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row key="C">
                    <NxTable.Cell>Confidentiality:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'C').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxTooltip title={getByValue(elements, 'C').tooltip} placement="top">
                        <NxFontAwesomeIcon
                          icon={faQuestionCircle as IconDefinition}
                          color="rgb(4, 89, 200)"
                        />
                      </NxTooltip>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row key="I">
                    <NxTable.Cell>Integrity:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'I').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxTooltip title={getByValue(elements, 'I').tooltip} placement="top">
                        <NxFontAwesomeIcon
                          icon={faQuestionCircle as IconDefinition}
                          color="rgb(4, 89, 200)"
                        />
                      </NxTooltip>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row key="A">
                    <NxTable.Cell>Availability: </NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'A').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxTooltip title={getByValue(elements, 'A').tooltip} placement="top">
                        <NxFontAwesomeIcon
                          icon={faQuestionCircle as IconDefinition}
                          color="rgb(4, 89, 200)"
                        />
                      </NxTooltip>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row key="AV">
                    <NxTable.Cell>Attack Vector:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'AV').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxTooltip title={getByValue(elements, 'AV').tooltip} placement="top">
                        <NxFontAwesomeIcon
                          icon={faQuestionCircle as IconDefinition}
                          color="rgb(4, 89, 200)"
                        />
                      </NxTooltip>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row key="PR">
                    <NxTable.Cell>Privileges Required:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'PR').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxTooltip title={getByValue(elements, 'PR').tooltip} placement="top">
                        <NxFontAwesomeIcon
                          icon={faQuestionCircle as IconDefinition}
                          color="rgb(4, 89, 200)"
                        />
                      </NxTooltip>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row key="UI">
                    <NxTable.Cell>User Interaction:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'UI').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxTooltip title={getByValue(elements, 'UI').tooltip} placement="top">
                        <NxFontAwesomeIcon
                          icon={faQuestionCircle as IconDefinition}
                          color="rgb(4, 89, 200)"
                        />
                      </NxTooltip>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row key="S">
                    <NxTable.Cell>Scope:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'S').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxTooltip title={getByValue(elements, 'S').tooltip} placement="top">
                        <NxFontAwesomeIcon
                          icon={faQuestionCircle as IconDefinition}
                          color="rgb(4, 89, 200)"
                        />
                      </NxTooltip>
                    </NxTable.Cell>
                  </NxTable.Row>
                </NxTable.Body>
              </NxTable>
            </div>
          </div>
        </div>
      </React.Fragment>
    );    
    
  };

  return renderCVSS(vector);
};

export default CVSSExplained;
