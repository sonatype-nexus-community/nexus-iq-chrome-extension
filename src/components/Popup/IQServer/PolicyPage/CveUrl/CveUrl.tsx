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
import { useState } from 'react'

// export interface ReasonString {
//   reason: string;
// }

type ReasonProps = {
    reasonString: string
}

const CveUrl = (props: ReasonProps): { newReason: string } => {
    const [iqServerUrl, setIqServerUrl] = useState('')
    chrome.storage.local.get('iqServerURL', function (result) {
        setIqServerUrl(result.iqServerURL)
    })
    const newReason: string = props.reasonString.replace(
        /((CVE|sonatype)-[0-9]{4}-[0-9]+)/,
        `<NxTextLink external href="${iqServerUrl}/assets/index.html#/vulnerabilities/$1>$1</NxTextLink>"`
    )

    return { newReason }
}

export default CveUrl
