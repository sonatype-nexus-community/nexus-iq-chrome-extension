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
import Options from './components/Options/Options'
import Install from './components/Install/Install'
import Help from './components/Help/Help'

export interface NexusOptionsContainerInterace {
    install: boolean
    help: boolean
}

export const NexusOptionsContainer = (props: NexusOptionsContainerInterace) => {
    return (
        <React.Fragment>
            {props.help && <Help />}
            {props.install && <Install />}
            {!props.help && !props.install && <Options />}
        </React.Fragment>
    )
}
