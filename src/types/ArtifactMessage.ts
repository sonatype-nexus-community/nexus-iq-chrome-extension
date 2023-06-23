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
import { RepoType } from '../utils/Constants'

export interface ArtifactMessage {
    type: string
    url: string
    repoTypeInfo: RepoType
}

export interface ArtifactMessageResponse {
    type: string
    artifact: ComponentDetails
}

export interface ComponentDetails {
    componentDetails: ComponentContainer[]
}

export interface ComponentContainer {
    component: Component
    matchState: string | null | undefined
    catalogDate: string | null | undefined
    relativePopularity: string | null | undefined
    securityData: SecurityData | null | undefined
    licenseData: LicenseData | null | undefined
}

export interface Component {
    packageUrl: string
    name: string | null | undefined
    hash: string | null | undefined
    componentIdentifier?: ComponentIdentifier
}

export interface ComponentIdentifier {
    format: string
    coordinates: Coordinates
}

export interface Coordinates {
    artifactId: string
    classifier: string
    extension: string
    groupId: string
    version: string
}

export interface SecurityData {
    securityIssues: SecurityIssue[]
}

//TODO: these are duplicated because of @sonatype/js-sona-types/ComponentDetails.ts
export interface SecurityIssue {
    source: string
    reference: string
    severity: number
    url: string
    description: string | null | undefined
    vector?: string | null | undefined
}

export interface LicenseData {
    declaredLicenses: LicenseDetail[]
    effectiveLicenses: LicenseDetail[]
    observedLicenses: LicenseDetail[]
}

export interface LicenseDetail {
    licenseId: string
    licenseName: string
}

export function sortSecurityIssues(securityIssues: SecurityIssue[]): SecurityIssue[] {
    return securityIssues
        .sort((a: SecurityIssue, b: SecurityIssue) => {
            return b.reference > a.reference ? 1 : -1
        })
        .sort((a: SecurityIssue, b: SecurityIssue) => {
            return b.severity - a.severity
        })
}
