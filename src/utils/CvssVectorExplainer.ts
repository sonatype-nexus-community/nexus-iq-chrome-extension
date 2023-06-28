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

// https://www.first.org/cvss/specification-document
const ATTACK_VECTOR_NAME = 'Attack Vector'
const ATTACK_COMPLEXITY_NAME = 'Attack Complexity'
const PRIVILEGES_REQUIRED_NAME = 'Privileges Required'
const USER_INTERACTION_NAME = 'User Interaction'
const SCOPE_NAME = 'Scope'
const CONFIDENTIALITY_IMPACT_NAME = 'Confidentiality Impact'
const INTEGRITY_IMPACT_NAME = 'Integrity Impact'
const AVAILABILITY_IMPACT_NAME = 'Availability Impact'

const ATTACK_VECTOR_CODE = 'AV'
const ATTACK_COMPLEXITY_CODE = 'AC'
const PRIVILEGES_REQUIRED_CODE = 'PR'
const USER_INTERACTION_CODE = 'UI'
const SCOPE_CODE = 'S'
const CONFIDENTIALITY_IMPACT_CODE = 'C'
const INTEGRITY_IMPACT_CODE = 'I'
const AVAILABILITY_IMPACT_CODE = 'A'

interface VectorDetails {
    vectorName: string
    vector: string
    quickExplanation: string
    color: string
    tooltip?: string
}
// e.g. Attack Vector:Network Attack Complexity:Low Privileges Required:None User Interaction:None Scope:Unchanged Confidentiality Impact:High Integrity Impact:High Availability Impact:High
const CvssVectorExplainer = (vectors: string[]): Map<string, VectorDetails> => {
    const result = new Map<string, VectorDetails>()

    vectors.forEach((vector) => {
        switch (vector) {
            case 'AV:N':
                result.set(ATTACK_VECTOR_CODE, {
                    vector: vector,
                    vectorName: ATTACK_VECTOR_NAME,
                    quickExplanation: 'Network',
                    color: 'indigo',
                    tooltip: `The vulnerable component is bound to the network stack and the set of possible attackers extends beyond the other options listed below, up to and including the entire Internet. Such a vulnerability is often termed “remotely exploitable” and can be thought of as an attack being exploitable at the protocol level one or more network hops away (e.g., across one or more routers). An example of a network attack is an attacker causing a denial of service (DoS) by sending a specially crafted TCP packet across a wide area network (e.g., CVE‑2004‑0230).`,
                })
                break
            case 'AV:A':
                result.set(ATTACK_VECTOR_CODE, {
                    vector: vector,
                    vectorName: ATTACK_VECTOR_NAME,
                    quickExplanation: 'Adjacent Network',
                    color: 'indigo',
                    tooltip:
                        'The vulnerable component is bound to the network stack, but the attack is limited <em>at the protocol level</em> to a logically adjacent topology. This can mean an attack must be launched from the same shared physical (e.g., Bluetooth or IEEE 802.11) or logical (e.g., local IP subnet) network, or from within a secure or otherwise limited administrative domain (e.g., MPLS, secure VPN to an administrative network zone). One example of an Adjacent attack would be an ARP (IPv4) or neighbor discovery (IPv6) flood leading to a denial of service on the local LAN segment (e.g., CVE‑2013‑6014).',
                })
                break
            case 'AV:L':
                result.set(ATTACK_VECTOR_CODE, {
                    vector: vector,
                    vectorName: ATTACK_VECTOR_NAME,
                    quickExplanation: 'Local',
                    color: 'indigo',
                    tooltip:
                        'The vulnerable component is not bound to the network stack and the attacker’s path is via read/write/execute capabilities. Either:<ul><li>the attacker exploits the vulnerability by accessing the target system locally (e.g., keyboard, console), or remotely (e.g., SSH); or</li><li>the attacker relies on User Interaction by another person to perform actions required to exploit the vulnerability (e.g., using social engineering techniques to trick a legitimate user into opening a malicious document).</li></ul>',
                })
                break
            case 'AV:P':
                // Hell yeah Alien Vs Predator
                result.set(ATTACK_VECTOR_CODE, {
                    vector: vector,
                    vectorName: ATTACK_VECTOR_NAME,
                    quickExplanation: 'Physical',
                    color: 'indigo',
                    tooltip:
                        'The attack requires the attacker to physically touch or manipulate the vulnerable component. Physical interaction may be brief (e.g., evil maid attack[^1]) or persistent. An example of such an attack is a cold boot attack in which an attacker gains access to disk encryption keys after physically accessing the target system. Other examples include peripheral attacks via FireWire/USB Direct Memory Access (DMA).',
                })
                break
            case 'AC:L':
                result.set(ATTACK_COMPLEXITY_CODE, {
                    vector: vector,
                    vectorName: ATTACK_COMPLEXITY_NAME,
                    quickExplanation: 'Low',
                    color: 'red',
                    tooltip:
                        'Specialized access conditions or extenuating circumstances do not exist. An attacker can expect repeatable success when attacking the vulnerable component.',
                })
                break
            case 'AC:H':
                result.set(ATTACK_COMPLEXITY_CODE, {
                    vector: vector,
                    vectorName: ATTACK_COMPLEXITY_NAME,
                    quickExplanation: 'High',
                    color: 'blue',
                    tooltip: `A successful attack depends on conditions beyond the attacker's control. That is, a successful attack cannot be accomplished at will, but requires the attacker to invest in some measurable amount of effort in preparation or execution against the vulnerable component before a successful attack can be expected.[^2] For example, a successful attack may depend on an attacker overcoming any of the following conditions:<ul><li>The attacker must gather knowledge about the environment in which the vulnerable target/component exists. For example, a requirement to collect details on target configuration settings, sequence numbers, or shared secrets.</li><li>The attacker must prepare the target environment to improve exploit reliability. For example, repeated exploitation to win a race condition, or overcoming advanced exploit mitigation techniques.</li><li>The attacker must inject themselves into the logical network path between the target and the resource requested by the victim in order to read and/or modify network communications (e.g., a man in the middle attack).</li></ul>`,
                })
                break
            case 'PR:N':
                result.set(PRIVILEGES_REQUIRED_CODE, {
                    vector: vector,
                    vectorName: PRIVILEGES_REQUIRED_NAME,
                    quickExplanation: 'None',
                    color: 'red',
                    tooltip: `The attacker is unauthorized prior to attack, and therefore does not require any access to settings or files of the vulnerable system to carry out an attack.`,
                })
                break
            case 'PR:L':
                result.set(PRIVILEGES_REQUIRED_CODE, {
                    vector: vector,
                    vectorName: PRIVILEGES_REQUIRED_NAME,
                    quickExplanation: 'Low',
                    color: 'orange',
                    tooltip: `The attacker requires privileges that provide basic user capabilities that could normally affect only settings and files owned by a user. Alternatively, an attacker with Low privileges has the ability to access only non-sensitive resources.`,
                })
                break
            case 'PR:H':
                result.set(PRIVILEGES_REQUIRED_CODE, {
                    vector: vector,
                    vectorName: PRIVILEGES_REQUIRED_NAME,
                    quickExplanation: 'High',
                    color: 'blue',
                    tooltip: `The attacker requires privileges that provide significant (e.g., administrative) control over the vulnerable component allowing access to component-wide settings and files.`,
                })
                break
            case 'UI:N':
                result.set(USER_INTERACTION_CODE, {
                    vectorName: USER_INTERACTION_NAME,
                    vector: vector,
                    quickExplanation: 'None',
                    color: 'red',
                    tooltip: `The vulnerable system can be exploited without interaction from any user.`,
                })
                break
            case 'UI:R':
                result.set(USER_INTERACTION_CODE, {
                    vector: vector,
                    vectorName: USER_INTERACTION_NAME,
                    quickExplanation: 'Required',
                    color: 'orange',
                    tooltip: `Successful exploitation of this vulnerability requires a user to take some action before the vulnerability can be exploited. For example, a successful exploit may only be possible during the installation of an application by a system administrator.`,
                })
                break
            case 'S:U':
                result.set(SCOPE_CODE, {
                    vector: vector,
                    vectorName: SCOPE_NAME,
                    quickExplanation: 'Unchanged',
                    color: 'indigo',
                    tooltip: `An exploited vulnerability can only affect resources managed by the same security authority. In this case, the vulnerable component and the impacted component are either the same, or both are managed by the same security authority.`,
                })
                break
            case 'S:C':
                result.set(SCOPE_CODE, {
                    vector: vector,
                    vectorName: SCOPE_NAME,
                    quickExplanation: 'Changed',
                    color: 'lime',
                    tooltip: `An exploited vulnerability can affect resources beyond the security scope managed by the security authority of the vulnerable component. In this case, the vulnerable component and the impacted component are different and managed by different security authorities.`,
                })
                break
            case 'C:N':
                result.set(CONFIDENTIALITY_IMPACT_CODE, {
                    vector: vector,
                    vectorName: CONFIDENTIALITY_IMPACT_NAME,
                    quickExplanation: 'None',
                    color: 'indigo',
                    tooltip: `There is no loss of confidentiality within the impacted component.`,
                })
                break
            case 'C:L':
                result.set(CONFIDENTIALITY_IMPACT_CODE, {
                    vector: vector,
                    vectorName: CONFIDENTIALITY_IMPACT_NAME,
                    quickExplanation: 'Low',
                    color: 'orange',
                    tooltip: `There is some loss of confidentiality. Access to some restricted information is obtained, but the attacker does not have control over what information is obtained, or the amount or kind of loss is limited. The information disclosure does not cause a direct, serious loss to the impacted component.`,
                })
                break
            case 'C:H':
                result.set(CONFIDENTIALITY_IMPACT_CODE, {
                    vector: vector,
                    vectorName: CONFIDENTIALITY_IMPACT_NAME,
                    quickExplanation: 'High',
                    color: 'red',
                    tooltip: `There is a total loss of confidentiality, resulting in all resources within the impacted component being divulged to the attacker. Alternatively, access to only some restricted information is obtained, but the disclosed information presents a direct, serious impact. For example, an attacker steals the administrator's password, or private encryption keys of a web server.`,
                })
                break
            case 'I:N':
                result.set(INTEGRITY_IMPACT_CODE, {
                    vector: vector,
                    vectorName: INTEGRITY_IMPACT_NAME,
                    quickExplanation: 'None',
                    color: 'indigo',
                    tooltip: `There is no loss of integrity within the impacted component.`,
                })
                break
            case 'I:L':
                result.set(INTEGRITY_IMPACT_CODE, {
                    vector: vector,
                    vectorName: INTEGRITY_IMPACT_NAME,
                    quickExplanation: 'Low',
                    color: 'orange',
                    tooltip: `Modification of data is possible, but the attacker does not have control over the consequence of a modification, or the amount of modification is limited. The data modification does not have a direct, serious impact on the impacted component.`,
                })
                break
            case 'I:H':
                result.set(INTEGRITY_IMPACT_CODE, {
                    vector: vector,
                    vectorName: INTEGRITY_IMPACT_NAME,
                    quickExplanation: 'High',
                    color: 'red',
                    tooltip: `There is a total loss of integrity, or a complete loss of protection. For example, the attacker is able to modify any/all files protected by the impacted component. Alternatively, only some files can be modified, but malicious modification would present a direct, serious consequence to the impacted component.`,
                })
                break
            case 'A:N':
                result.set(AVAILABILITY_IMPACT_CODE, {
                    vector: vector,
                    vectorName: AVAILABILITY_IMPACT_NAME,
                    quickExplanation: 'None',
                    color: 'indigo',
                    tooltip: `There is no impact to availability within the impacted component.`,
                })
                break
            case 'A:L':
                result.set(AVAILABILITY_IMPACT_CODE, {
                    vector: vector,
                    vectorName: AVAILABILITY_IMPACT_NAME,
                    quickExplanation: 'Low',
                    color: 'orange',
                    tooltip: `Performance is reduced or there are interruptions in resource availability. Even if repeated exploitation of the vulnerability is possible, the attacker does not have the ability to completely deny service to legitimate users. The resources in the impacted component are either partially available all of the time, or fully available only some of the time, but overall there is no direct, serious consequence to the impacted component.`,
                })
                break
            case 'A:H':
                result.set(AVAILABILITY_IMPACT_CODE, {
                    vector: vector,
                    vectorName: AVAILABILITY_IMPACT_NAME,
                    quickExplanation: 'High',
                    color: 'red',
                    tooltip: `There is a total loss of availability, resulting in the attacker being able to fully deny access to resources in the impacted component; this loss is either sustained (while the attacker continues to deliver the attack) or persistent (the condition persists even after the attack has completed). Alternatively, the attacker has the ability to deny some availability, but the loss of availability presents a direct, serious consequence to the impacted component (e.g., the attacker cannot disrupt existing connections, but can prevent new connections; the attacker can repeatedly exploit a vulnerability that, in each instance of a successful attack, leaks a only small amount of memory, but after repeated exploitation causes a service to become completely unavailable).`,
                })
                break
            default:
                // Do nothing
                break
        }
    })

    return result
}

export { CvssVectorExplainer, VectorDetails }
