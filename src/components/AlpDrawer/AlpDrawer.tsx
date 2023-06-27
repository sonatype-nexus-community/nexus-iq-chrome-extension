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
import { NxDrawer } from '@sonatype/react-shared-components'
import React, { useState } from 'react'
import AdvancedLegalDisplay from '../Popup/IQServer/LicensingPage/AdvancedLegalDisplay/AdvancedLegalDisplay'

export default function AlpDrawer() {
    const [alpDrawerOpen, setAlpDrawerOpen] = useState<boolean>(false)

    return (
        <NxDrawer
            id='nx-drawer-legal'
            open={alpDrawerOpen}
            onClose={() => {
                setAlpDrawerOpen(false)
            }}
            aria-labelledby='drawer-legal-title'
        >
            <NxDrawer.Header>
                <NxDrawer.HeaderTitle id='drawer-legal-title'>
                    <span>
                        <img
                            src='/images/add-on-sonatype-icon-logoblue.png'
                            className='nx-popup-logo'
                            alt='Powered by Advanced Legal Pack'
                        />
                    </span>
                    <span>&nbsp;&nbsp;Advanced Legal Pack</span>
                </NxDrawer.HeaderTitle>
            </NxDrawer.Header>
            <NxDrawer.Content tabIndex={0}>
                <AdvancedLegalDisplay />
            </NxDrawer.Content>
        </NxDrawer>
    )
}
