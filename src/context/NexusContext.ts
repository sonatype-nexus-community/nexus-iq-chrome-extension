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
  ILogger,
  IqServerComponentPolicyEvaluationResult,
  IqServerComponentRemediationResult,
  IqServerLicenseLegalMetadataResult,
  IqServerVulnerabilityDetails
} from '@sonatype/js-sona-types';
import {DATA_SOURCES} from '../utils/Constants';
import BrowserExtensionLogger from '../logger/Logger';

export interface NexusContextInterface {
  scanType: string;
  componentDetails?: ComponentContainer;
  policyDetails?: IqServerComponentPolicyEvaluationResult;
  vulnDetails?: IqServerVulnerabilityDetails;
  licenseDetails?: IqServerLicenseLegalMetadataResult;
  errorMessage?: string;
  componentVersions?: string[];
  remediationDetails?: IqServerComponentRemediationResult;
  logger: ILogger;
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
  logger: undefined
};

export const NexusContext = React.createContext(initialContext);
