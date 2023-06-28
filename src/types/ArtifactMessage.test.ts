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
import { describe, expect, test } from '@jest/globals'
import { SecurityData, SecurityIssue, sortSecurityIssues } from './ArtifactMessage'
const securityDataRaw = `{
    "securityData": {
        "securityIssues": [
            {
                "source": "cve",
                "reference": "CVE-2020-28500",
                "severity": 5.3,
                "url": "http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-28500",
                "threatCategory": "severe"
            },
            {
                "source": "cve",
                "reference": "CVE-2021-23337",
                "severity": 7.2,
                "url": "http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-23337",
                "threatCategory": "critical"
            },
            {
                "source": "sonatype",
                "reference": "sonatype-2019-0467",
                "severity": 9.8,
                "url": "http://iq-server:8070/ui/links/vln/sonatype-2019-0467",
                "threatCategory": "critical"
            },
            {
                "source": "sonatype",
                "reference": "sonatype-2020-0292",
                "severity": 7.5,
                "url": "http://iq-server:8070/ui/links/vln/sonatype-2020-0292",
                "threatCategory": "critical"
            },
            {
                "source": "sonatype",
                "reference": "sonatype-2020-0739",
                "severity": 9.8,
                "url": "http://iq-server:8070/ui/links/vln/sonatype-2020-0739",
                "threatCategory": "critical"
            }
        ]
    }
}`

describe('Artifact Message Test', () => {
    test('should sort security issues', () => {
        const securityData: SecurityData = JSON.parse(securityDataRaw).securityData
        // console.trace("securityData",  securityData.securityIssues);
        const sortedIssues: SecurityIssue[] = sortSecurityIssues(securityData.securityIssues)
        expect(sortedIssues).toBeDefined()
        expect(sortedIssues[0].severity).toBeGreaterThanOrEqual(sortedIssues[sortedIssues.length - 1].severity)
        expect(sortedIssues[0].severity).toBe(9.8)
        expect(sortedIssues.length).toBe(5)
        expect(sortedIssues[sortedIssues.length - 1].severity).toBe(5.3)
    })
})
