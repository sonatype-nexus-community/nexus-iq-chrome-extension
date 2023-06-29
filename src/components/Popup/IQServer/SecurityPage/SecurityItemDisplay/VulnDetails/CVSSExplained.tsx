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
import React from 'react'
import { CvssVectorExplainer, VectorDetails } from '../../../../../../utils/CvssVectorExplainer'
import { Icon } from '@fortawesome/fontawesome-svg-core'

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { NxTable, NxFontAwesomeIcon, NxH3, NxTooltip } from '@sonatype/react-shared-components'

const CVSSExplained = ({ vector }): JSX.Element | null => {
    function getByValue(map, searchValue) {
        for (const [key, value] of map.entries()) {
            if (key === searchValue) return value
        }
    }

    const renderCVSS = (vector) => {
        return (
            <React.Fragment>
                <div className='nx-vulnerability-details'>
                    <div className='nx-grid-row'>
                        <div className='nx-grid-col'>
                            <dl className={'nx-read-only'}>
                                <dt></dt>
                                <dd>
                                    <span>{'\xa0'.repeat(29)}</span>
                                </dd>
                            </dl>
                        </div>

                        <div className='nx-grid-col'>
                            <NxTable>
                                <NxTable.Head>
                                    <NxH3>CVSS Explained</NxH3>
                                </NxTable.Head>
                                <NxTable.Body>
                                    {renderCVSSVectorRow('AC', vector)}
                                    {renderCVSSVectorRow('C', vector)}
                                    {renderCVSSVectorRow('I', vector)}
                                    {renderCVSSVectorRow('A', vector)}
                                    {renderCVSSVectorRow('AV', vector)}
                                    {renderCVSSVectorRow('PR', vector)}
                                    {renderCVSSVectorRow('UI', vector)}
                                    {renderCVSSVectorRow('S', vector)}
                                </NxTable.Body>
                            </NxTable>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )

        function renderCVSSVectorRow(key, vector) {
            const cvssElements = vector.split('/')
            const elements = CvssVectorExplainer(cvssElements)
            const vectorDetails: VectorDetails = getByValue(elements, key)
            return (
                <NxTable.Row key={key}>
                    <NxTable.Cell>{vectorDetails.vectorName}:</NxTable.Cell>
                    <NxTable.Cell align='right'>{vectorDetails.quickExplanation}</NxTable.Cell>
                    <NxTable.Cell>
                        <NxTooltip title={vectorDetails.tooltip} placement='top'>
                            <NxFontAwesomeIcon icon={faQuestionCircle as Icon} color='rgb(4, 89, 200)' />
                        </NxTooltip>
                    </NxTable.Cell>
                </NxTable.Row>
            )
        }
    }

    return renderCVSS(vector)
}

export default CVSSExplained
