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

import { ApiComponentPolicyViolationListDTOV2, ApiPolicyViolationDTOV2 } from '@sonatype/nexus-iq-api-client'

export enum ComponentState {
    CRITICAL,
    SEVERE,
    MODERATE,
    LOW,
    NONE,
    EVALUATING,
}

export function getMaxThreatLevelForPolicyData(policydata: ApiComponentPolicyViolationListDTOV2): number {
    if (policydata.policyViolations !== undefined && policydata.policyViolations.length > 0) {
        return Math.max(
            ...policydata.policyViolations.map((violation) =>
                violation.threatLevel != undefined ? violation.threatLevel : 0
            )
        )
    }
    return 0
}

export function getMaxThreatLevelForPolicyViolations(policyViolations: ApiPolicyViolationDTOV2[]): number {
    if (policyViolations !== undefined && policyViolations.length > 0) {
        return Math.max(
            ...policyViolations.map((violation) => (violation.threatLevel != undefined ? violation.threatLevel : 0))
        )
    }
    return 0
}

export function getForComponentPolicyViolations(policydata?: ApiComponentPolicyViolationListDTOV2): ComponentState {
    if (policydata !== undefined) {
        const maxThreatLevel = getMaxThreatLevelForPolicyData(policydata)
        if (maxThreatLevel >= 8) {
            return ComponentState.CRITICAL
        } else if (maxThreatLevel >= 4) {
            return ComponentState.SEVERE
        } else if (maxThreatLevel >= 2) {
            return ComponentState.MODERATE
        } else if (maxThreatLevel > 0) {
            return ComponentState.LOW
        } else {
            return ComponentState.NONE
        }
    } else {
        return ComponentState.NONE
    }
}
