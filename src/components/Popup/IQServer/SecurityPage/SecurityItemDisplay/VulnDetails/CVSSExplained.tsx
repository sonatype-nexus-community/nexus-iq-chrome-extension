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
import { NxButton, NxButtonBar, NxFontAwesomeIcon, NxH3 } from '@sonatype/react-shared-components';

const CVSSExplained = ({ vector }): JSX.Element | null => {
  function getByValue(map, searchValue) {
    // console.log("getByValue", map, searchValue);
    for (let [key, value] of map.entries()) {
      if (key === searchValue) return value;
    }
  }
  
  const renderCVSS = (vector) => {    
    const cvssElements = vector.split('/');
    const elements = CvssVectorExplainer(cvssElements);
    // console.log('vector', vector, cvssElements, elements);
    
    return (
      <React.Fragment>
        <div className="nx-grid-row">
          <div className="nx-grid-col"></div>
          <div className="nx-grid-col">
            <NxH3 className={'nx-h3'}>CVSS Explained</NxH3>
            <dl>
              <dt>Attack Complexity</dt>
              <dd>
                {getByValue(elements, 'AC').quickExplanation}
                {/* according to this document icon-only should generate a tool tip https://gallery.sonatype.dev/#/pages/Button */}
                {/* {getByValue(elements, 'AC').tooltip} */}
                
                  <NxButton
                    variant="icon-only"
                    title="this should be the AC Tooltip, this should be the AC Tooltip, this should be the AC Tooltip, this should be the AC Tooltip, this should be the AC Tooltip, this should be the AC Tooltip, this should be the AC Tooltip, this should be the AC Tooltip, this should be the AC Tooltip"
                  >
                    <NxFontAwesomeIcon icon={faQuestionCircle} />
                  </NxButton>
                
              </dd>

              <dt>Confidentiality</dt>
              <dd>
                {getByValue(elements, 'C').quickExplanation}
                <NxButton variant="icon-only" title={getByValue(elements, 'C').tooltip}>
                  <NxFontAwesomeIcon icon={faQuestionCircle} />
                </NxButton>
              </dd>

              <dt>Integrity</dt>
              <dd>
                {getByValue(elements, 'I').quickExplanation}
                <NxButton variant="icon-only" title={getByValue(elements, 'I').tooltip}>
                  <NxFontAwesomeIcon icon={faQuestionCircle} />
                </NxButton>
              </dd>
              <dt>Availability</dt>
              <dd>
                {' '}
                {getByValue(elements, 'A').quickExplanation}
                <NxButton variant="icon-only" title={getByValue(elements, 'A').tooltip}>
                  <NxFontAwesomeIcon icon={faQuestionCircle} />
                </NxButton>
              </dd>

              <dt>Attack Vector</dt>
              <dd>
                {getByValue(elements, 'AV').quickExplanation}
                <NxButton variant="icon-only" title={getByValue(elements, 'AV').tooltip}>
                  <NxFontAwesomeIcon icon={faQuestionCircle} />
                </NxButton>
              </dd>

              <dt>Privileges Required</dt>
              <dd>
                {' '}
                {getByValue(elements, 'PR').quickExplanation}
                <NxButton variant="icon-only" title={getByValue(elements, 'PR').tooltip}>
                  <NxFontAwesomeIcon icon={faQuestionCircle} />
                </NxButton>
              </dd>

              <dt>User Interaction</dt>
              <dd>
                {' '}
                {getByValue(elements, 'UI').quickExplanation}
                <NxButton variant="icon-only" title={getByValue(elements, 'UI').tooltip}>
                  <NxFontAwesomeIcon icon={faQuestionCircle} />
                </NxButton>
              </dd>

              <dt>Scope</dt>
              <dd>
                {' '}
                {getByValue(elements, 'S').quickExplanation}
                <NxButton variant="icon-only" title={getByValue(elements, 'S').tooltip}>
                  <NxFontAwesomeIcon icon={faQuestionCircle} />
                </NxButton>
              </dd>
            </dl>
          </div>
        </div>
      </React.Fragment>
    );    
    
  };

  return renderCVSS(vector);
};

export default CVSSExplained;
