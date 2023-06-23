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
const ATTACK_VECTOR = 'Attack Vector'
const ATTACK_COMPLEXITY = 'Attack Complexity'
const PRIVILEGES_REQUIRED = 'Privileges Required'
const USER_INTERACTION = 'User Interaction'
const SCOPE = 'Scope'
const CONFIDENTIALITY_IMPACT = 'Confidentiality Impact'
const INTEGRITY_IMPACT = 'Integrity Impact'
const AVAILABILITY_IMPACT = 'Availability Impact'

interface VectorDetails {
    vector: string
    quickExplanation: string
    color: string
    tooltip?: string
}

const CvssVectorExplainer = (vectors: string[]): Map<string, VectorDetails> => {
    const result = new Map<string, VectorDetails>()

    vectors.forEach((vector) => {
        switch (vector) {
            case 'AV:N':
                result.set(ATTACK_VECTOR, { vector: vector, quickExplanation: 'Network', color: 'indigo' })
                break
            case 'AV:A':
                result.set(ATTACK_VECTOR, {
                    vector: vector,
                    quickExplanation: 'Adjacent Network',
                    color: 'indigo',
                })
                break
            case 'AV:L':
                result.set(ATTACK_VECTOR, { vector: vector, quickExplanation: 'Local', color: 'indigo' })
                break
            case 'AV:P':
                // Hell yeah Alien Vs Predator
                result.set(ATTACK_VECTOR, { vector: vector, quickExplanation: 'Physical', color: 'indigo' })
                break
            case 'AC:L':
                result.set(ATTACK_COMPLEXITY, { vector: vector, quickExplanation: 'Low', color: 'red' })
                break
            case 'AC:H':
                result.set(ATTACK_COMPLEXITY, { vector: vector, quickExplanation: 'High', color: 'blue' })
                break
            case 'PR:N':
                result.set(PRIVILEGES_REQUIRED, { vector: vector, quickExplanation: 'None', color: 'red' })
                break
            case 'PR:L':
                result.set(PRIVILEGES_REQUIRED, { vector: vector, quickExplanation: 'Low', color: 'orange' })
                break
            case 'PR:H':
                result.set(PRIVILEGES_REQUIRED, { vector: vector, quickExplanation: 'High', color: 'blue' })
                break
            case 'UI:N':
                result.set(USER_INTERACTION, { vector: vector, quickExplanation: 'None', color: 'red' })
                break
            case 'UI:R':
                result.set(USER_INTERACTION, {
                    vector: vector,
                    quickExplanation: 'Required',
                    color: 'orange',
                })
                break
            case 'S:U':
                result.set(SCOPE, { vector: vector, quickExplanation: 'Unchanged', color: 'indigo' })
                break
            case 'S:C':
                result.set(SCOPE, { vector: vector, quickExplanation: 'Changed', color: 'lime' })
                break
            case 'C:N':
                result.set(CONFIDENTIALITY_IMPACT, {
                    vector: vector,
                    quickExplanation: 'None',
                    color: 'indigo',
                })
                break
            case 'C:L':
                result.set(CONFIDENTIALITY_IMPACT, {
                    vector: vector,
                    quickExplanation: 'Low',
                    color: 'orange',
                })
                break
            case 'C:H':
                result.set(CONFIDENTIALITY_IMPACT, {
                    vector: vector,
                    quickExplanation: 'High',
                    color: 'red',
                })
                break
            case 'I:N':
                result.set(INTEGRITY_IMPACT, { vector: vector, quickExplanation: 'None', color: 'indigo' })
                break
            case 'I:L':
                result.set(INTEGRITY_IMPACT, { vector: vector, quickExplanation: 'Low', color: 'orange' })
                break
            case 'I:H':
                result.set(INTEGRITY_IMPACT, { vector: vector, quickExplanation: 'High', color: 'red' })
                break
            case 'A:N':
                result.set(AVAILABILITY_IMPACT, {
                    vector: vector,
                    quickExplanation: 'None',
                    color: 'indigo',
                })
                break
            case 'A:L':
                result.set(AVAILABILITY_IMPACT, { vector: vector, quickExplanation: 'Low', color: 'orange' })
                break
            case 'A:H':
                result.set(AVAILABILITY_IMPACT, { vector: vector, quickExplanation: 'High', color: 'red' })
                break
            default:
                // Do nothing
                break
        }
    })

    return result
}

export { CvssVectorExplainer, VectorDetails }
