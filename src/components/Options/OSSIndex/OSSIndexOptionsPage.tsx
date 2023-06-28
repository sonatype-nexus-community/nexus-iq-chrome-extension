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

import { NxFormGroup, NxStatefulTextInput } from '@sonatype/react-shared-components'
import React, { useContext } from 'react'
import { DEFAULT_EXTENSION_SETTINGS, ExtensionConfiguration } from '../../../types/ExtensionConfiguration'
import { ExtensionConfigurationContext } from '../../../context/ExtensionConfigurationContext'
import { nonEmptyValidator } from '../../Common/Validators'

export interface OssiServerOptionsPageInterface {
    setExtensionConfig: (settings: ExtensionConfiguration) => void
}

export default function OSSIndexOptionsPage(props: OssiServerOptionsPageInterface) {
    const extensionSettings = useContext(ExtensionConfigurationContext)
    const setExtensionConfig = props.setExtensionConfig

    /**
     * Field onChange Handlers
     */
    function handleOssiUserChange(e) {
        const newExtensionSettings = extensionSettings !== undefined ? extensionSettings : DEFAULT_EXTENSION_SETTINGS
        newExtensionSettings.user = e as string
        setExtensionConfig(newExtensionSettings)
    }

    function handleOssiTokenChange(e) {
        const newExtensionSettings = extensionSettings !== undefined ? extensionSettings : DEFAULT_EXTENSION_SETTINGS
        newExtensionSettings.token = e as string
        setExtensionConfig(newExtensionSettings)
    }

    return (
        <form className='nx-form'>
            <NxFormGroup label={`Sonatype OSS Index Email Address`} isRequired>
                <NxStatefulTextInput
                    defaultValue={extensionSettings.user}
                    placeholder={`Enter your registered email address for OSS Index`}
                    aria-required={true}
                    validator={nonEmptyValidator}
                    onChange={handleOssiUserChange}
                />
            </NxFormGroup>
            <NxFormGroup label={`Sonatype OSS Index API Token`} isRequired>
                <NxStatefulTextInput
                    defaultValue={extensionSettings.token}
                    placeholder={`Enter your API Token for OSS Index`}
                    aria-required={true}
                    validator={nonEmptyValidator}
                    type='password'
                    onChange={handleOssiTokenChange}
                />
            </NxFormGroup>
        </form>
    )
}

// const OSSIndexOptionsPage = (): JSX.Element | null => {
//     const [ossIndexUser, setOSSIndexUser] = useState('')
//     const [ossIndexToken, setOSSIndexToken] = useState('')
//     const [loading, setLoading] = useState(true)

//     useEffect(() => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         chrome.storage.local.get((items: { [key: string]: any }) => {
//             if (items[OSS_INDEX_USER] !== undefined) {
//                 setOSSIndexUser(items[OSS_INDEX_USER])
//             }
//             if (items[OSS_INDEX_TOKEN] !== undefined) {
//                 setOSSIndexToken(items[OSS_INDEX_TOKEN])
//             }
//             setLoading(false)
//         })
//     }, [ossIndexUser, ossIndexToken])

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const setItem = (func: any, value: any, key: string) => {
//         func(value)
//         chrome.storage.local.set({ [key]: value })
//     }

//     const validator = (val: string) => {
//         return val.length ? null : 'Must be non-empty'
//     }

//     const renderOptions = () => {
//         if (!loading) {
//             return (
//                 <form className='nx-form'>
//                     <NxFormGroup label={`Sonatype OSS Index Email Address`} isRequired>
//                         <NxStatefulTextInput
//                             defaultValue={ossIndexUser}
//                             placeholder={`enter your email address`}
//                             aria-required={true}
//                             validator={validator}
//                             onChange={(event) => setItem(setOSSIndexUser, event, OSS_INDEX_USER)}
//                         />
//                     </NxFormGroup>
//                     <NxFormGroup label={`Sonatype OSS Index API Token`} isRequired>
//                         <NxStatefulTextInput
//                             defaultValue={ossIndexToken}
//                             placeholder={`enter your api token`}
//                             aria-required={true}
//                             validator={validator}
//                             type='password'
//                             onChange={(event) => setItem(setOSSIndexToken, event, OSS_INDEX_TOKEN)}
//                         />
//                     </NxFormGroup>
//                 </form>
//             )
//         }
//         return null
//     }

//     return renderOptions()
// }

// export default OSSIndexOptionsPage
