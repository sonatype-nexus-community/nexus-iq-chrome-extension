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
import {CvssVectorExplainer, VectorDetails} from '../../../../../../utils/CvssVectorExplainer';
import {  
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import {
  NxButton,
  NxTable,
  NxFontAwesomeIcon,
  NxH3
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
    // console.log('vector', vector, cvssElements, elements);
    
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
                  <NxTable.Row>
                    <NxTable.Cell>Attack Complexity:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'AC').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      {/* according to this document icon-only should generate a tool tip https://gallery.sonatype.dev/#/pages/Button */}
                      {/* not working at the moment and it's a bit of react magic which I can't work out */}
                      <NxButton variant="icon-only" title={getByValue(elements, 'AC').tooltip}>
                        <NxFontAwesomeIcon icon={faQuestionCircle} />
                      </NxButton>
                    </NxTable.Cell>                                          
                  </NxTable.Row>
                  <NxTable.Row>
                    <NxTable.Cell>Confidentiality:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'C').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxButton variant="icon-only" title={getByValue(elements, 'C').tooltip}>
                        <NxFontAwesomeIcon icon={faQuestionCircle} />
                      </NxButton>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row>
                    <NxTable.Cell>Integrity:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'I').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxButton variant="icon-only" title={getByValue(elements, 'I').tooltip}>
                        <NxFontAwesomeIcon icon={faQuestionCircle} />
                      </NxButton>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row>
                    <NxTable.Cell>Availability: </NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'A').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxButton variant="icon-only" title={getByValue(elements, 'A').tooltip}>
                        <NxFontAwesomeIcon icon={faQuestionCircle} />
                      </NxButton>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row>
                    <NxTable.Cell>Attack Vector:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'AV').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxButton variant="icon-only" title={getByValue(elements, 'AV').tooltip}>
                        <NxFontAwesomeIcon icon={faQuestionCircle} />
                      </NxButton>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row>
                    <NxTable.Cell>Privileges Required:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'PR').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxButton variant="icon-only" title={getByValue(elements, 'PR').tooltip}>
                        <NxFontAwesomeIcon icon={faQuestionCircle} />
                      </NxButton>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row>
                    <NxTable.Cell>User Interaction:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'UI').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxButton variant="icon-only" title={getByValue(elements, 'UI').tooltip}>
                        <NxFontAwesomeIcon icon={faQuestionCircle} />
                      </NxButton>
                    </NxTable.Cell>
                  </NxTable.Row>
                  <NxTable.Row>
                    <NxTable.Cell>Scope:</NxTable.Cell>
                    <NxTable.Cell>{getByValue(elements, 'S').quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                      <NxButton variant="icon-only" title={getByValue(elements, 'S').tooltip}>
                        <NxFontAwesomeIcon icon={faQuestionCircle} />
                      </NxButton>
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
