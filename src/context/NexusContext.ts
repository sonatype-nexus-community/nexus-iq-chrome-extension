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
import React from 'react';
import {
  ComponentContainer,
  ComponentDetails,
  ILogger,
  IqServerComponentPolicyEvaluationResult,
  IqServerComponentRemediationResult,
  IqServerLicenseLegalMetadataResult,
  IqServerVulnerabilityDetails
} from '@sonatype/js-sona-types';
import {DATA_SOURCES} from '../utils/Constants';
import {PackageURL} from 'packageurl-js';

export interface NexusContextInterface {
  scanType: string;
  componentDetails?: ComponentContainer;
  policyDetails?: IqServerComponentPolicyEvaluationResult;
  vulnDetails?: IqServerVulnerabilityDetails;
  licenseDetails?: IqServerLicenseLegalMetadataResult;
  errorMessage?: string;
  componentVersions?: string[];
  componentVersionsDetails?: ComponentContainer[];
  remediationDetails?: IqServerComponentRemediationResult;
  logger: ILogger;
  getVulnDetails?: (vulnId: string) => Promise<void>;
  getLicenseDetails?: (purl: string) => Promise<void>;
  getRemediationDetails?: (purl: string) => Promise<void>;
  currentVersion?: PackageURL;
}

const initialContext: NexusContextInterface = {
  scanType: DATA_SOURCES.OSSINDEX,
  componentDetails: undefined,
  policyDetails: undefined,
  vulnDetails: undefined,
  licenseDetails: undefined,
  errorMessage: undefined,
  componentVersions: undefined,
  remediationDetails: undefined,
  logger: undefined,
  currentVersion: undefined
};

export const NexusContext = React.createContext(initialContext);
