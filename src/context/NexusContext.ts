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
import {
  ComponentContainer,
  ILogger,
  IqServerComponentPolicyEvaluationResult,
  IqServerComponentRemediationResult,
  IqServerLicenseLegalMetadataResult,
  IqServerVulnerabilityDetails, LicenseData,
  Application
} from '@sonatype/js-sona-types';
import {PackageURL} from 'packageurl-js';
import React from 'react';
import {DATA_SOURCES} from '../utils/Constants';

export interface NexusContextInterface {
  showAlpDrawer: boolean;
  toggleAlpDrawer: () => void;
  scanType: string;
  componentDetails?: ComponentContainer;
  policyDetails?: IqServerComponentPolicyEvaluationResult;
  vulnDetails?: IqServerVulnerabilityDetails;
  licenseDetails?: IqServerLicenseLegalMetadataResult;
  licenseData?: LicenseData;
  errorMessage?: string;
  componentVersions?: string[];
  componentVersionsDetails?: ComponentContainer[];
  remediationDetails?: IqServerComponentRemediationResult;
  applications: Set<Application>;
  logger?: ILogger;
  getVulnDetails?: (vulnId: string) => Promise<void>;
  getLicenseDetails?: (purl: string) => Promise<void>;
  getRemediationDetails?: (purl: string) => Promise<void>;
  getComponentDetails?: (purl: string) => void;
  currentComponentPurl?: PackageURL;
  currentUrl: URL;
}

const initialContext: NexusContextInterface = {
  showAlpDrawer: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleAlpDrawer: () => {},
  scanType: DATA_SOURCES.OSSINDEX,
  componentDetails: undefined,
  policyDetails: undefined,
  vulnDetails: undefined,
  licenseDetails: undefined,
  licenseData: undefined,
  errorMessage: undefined,
  componentVersions: undefined,
  remediationDetails: undefined,
  logger: undefined,
  currentComponentPurl: undefined,
  currentUrl: new URL('about:blank'),
  applications: new Set<Application>()
};

export const NexusContext = React.createContext(initialContext);