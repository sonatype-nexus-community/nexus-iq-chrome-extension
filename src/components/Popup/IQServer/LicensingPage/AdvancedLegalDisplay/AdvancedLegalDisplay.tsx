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
import { NxH3, NxList } from '@sonatype/react-shared-components'
import React, { useContext } from 'react'
// import { ExtensionPopupContext } from '../../../../../context/ExtensionPopupContext'
import { ExtensionConfigurationContext } from '../../../../../context/ExtensionConfigurationContext'
import { DATA_SOURCE } from '../../../../../utils/Constants'

function IqAdvancedLegalDisplay() {
    // const popupContext = useContext(ExtensionPopupContext)

    // const copyToClipboard = (_event: React.MouseEvent, text: string) => {
    //     navigator.clipboard.writeText(text)
    // }

    return (
        <React.Fragment>
            <div className='nx-grid-row'>
                <section className='nx-grid-col nx-grid-col--100 nx-scrollable'>
                    <NxH3>Copy License Text</NxH3>
                    <NxList emptyMessage='No License Text Available'>
                        {/* {popupContext.iq?.componentDetails?.licenseData?.licenseLegalData.licenseFiles.map(
                                (licenses, index) => {
                                    return (
                                        <NxList.Item key={`${licenses.id}_${index}`}>
                                            <NxList.Text>{licenses.relPath}</NxList.Text>
                                            <NxList.Actions>
                                                <NxButton
                                                    title='Copy License Text'
                                                    variant='icon-only'
                                                    onClick={(event) => copyToClipboard(event, licenses.content)}>
                                                    <NxFontAwesomeIcon icon={faCopy as IconDefinition} />
                                                </NxButton>
                                            </NxList.Actions>
                                        </NxList.Item>
                                    )
                                }
                            )} */}
                    </NxList>
                    <NxH3>Copyright Statements</NxH3>
                    <NxList emptyMessage='No Copyright Statements Available'>
                        {/* {popupContext.iq?.componentDetails?.licenseData?.licenseLegalData.copyrights.map(
                                (copyrights) => {
                                    return (
                                        <NxList.Item key={copyrights.originalContentHash}>
                                            <NxList.Text>{copyrights.content}</NxList.Text>
                                        </NxList.Item>
                                    )
                                }
                            )} */}
                    </NxList>
                </section>
            </div>
        </React.Fragment>
    )
}

export default function AdvancedLegalDisplay() {
    const extensionContext = useContext(ExtensionConfigurationContext)

    return <div>{extensionContext.dataSource === DATA_SOURCE.NEXUSIQ && <IqAdvancedLegalDisplay />}</div>
}
