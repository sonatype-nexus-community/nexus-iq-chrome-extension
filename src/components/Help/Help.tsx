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
import { NxH2, NxP, NxPageTitle, NxTextLink, NxTile } from '@sonatype/react-shared-components'
import React from 'react'

export default function Help() {
    return (
        <React.Fragment>
            <h1>
                <NxPageTitle>Sonatype Platform Browser Extension Help</NxPageTitle>
            </h1>
            <NxTile>
                <NxTile.Header>
                    <NxTile.HeaderTitle>
                        <NxH2>Where do I go to get help?</NxH2>
                    </NxTile.HeaderTitle>
                </NxTile.Header>
                <NxTile.Content>
                    <NxP>
                        We have detailed documentation for the Sonatype Platform Browser Extension available&nbsp;
                        <NxTextLink
                            external
                            href='https://sonatype-nexus-community.github.io/nexus-iq-chrome-extension/'>
                            here
                        </NxTextLink>
                        &nbsp;.
                    </NxP>
                </NxTile.Content>
            </NxTile>
            <NxTile>
                <NxTile.Header>
                    <NxTile.HeaderTitle>
                        <NxH2>How can I make a Feature Request?</NxH2>
                    </NxTile.HeaderTitle>
                </NxTile.Header>
                <NxTile.Content>
                    <NxP>
                        We greatly value feedback. You can open a &nbsp;
                        <NxTextLink
                            external
                            href='https://sonatype-nexus-community.github.io/nexus-iq-chrome-extension/issues'>
                            GitHub Issue
                        </NxTextLink>
                        &nbsp; with your idea or question or reach out to your dedicated Customer Success
                        representative.
                    </NxP>
                </NxTile.Content>
            </NxTile>
            <NxTile>
                <NxTile.Header>
                    <NxTile.HeaderTitle>
                        <NxH2>I think I found a bug - who do I tell?</NxH2>
                    </NxTile.HeaderTitle>
                </NxTile.Header>
                <NxTile.Content>
                    <NxP>
                        We greatly value feedback. If you believe you have found a bug, please open a &nbsp;
                        <NxTextLink
                            external
                            href='https://sonatype-nexus-community.github.io/nexus-iq-chrome-extension/issues'>
                            GitHub Issue
                        </NxTextLink>
                        &nbsp; and provide as much information as you can including:
                        <ul>
                            <li>Details of your Web Browser (name and version)</li>
                            <li>Version of the Sonatype Platform Browser Extension you have installed</li>
                            <li>The action(s) you performed</li>
                            <li>The expected behaviour</li>
                            <li>The actual (unexpected) behaviour</li>
                        </ul>
                    </NxP>
                </NxTile.Content>
            </NxTile>
        </React.Fragment>
    )
}
