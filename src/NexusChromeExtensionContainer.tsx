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
import Popup from './components/Popup/Popup';
import {NexusContext, NexusContextInterface} from './context/NexusContext';
import {DATA_SOURCES, RepoType} from './utils/Constants';
import {findRepoType} from './utils/UrlParsing';
import {
  OSSIndexRequestService,
  IqRequestService,
  RequestService,
  ComponentDetails,
  LogLevel,
  ComponentContainer
} from '@sonatype/js-sona-types';
import {PackageURL} from 'packageurl-js';
import localforage from 'localforage';
import BrowserExtensionLogger from './logger/Logger';

const _browser = chrome ? chrome : browser;

type AppProps = {};

class NexusChromeExtensionContainer extends React.Component<AppProps, NexusContextInterface> {
  private _requestService: RequestService | undefined;

  constructor(props: AppProps) {
    super(props);

    this.state = {
      currentVersion: undefined,
      errorMessage: undefined,
      scanType: DATA_SOURCES.OSSINDEX,
      logger: new BrowserExtensionLogger(LogLevel.TRACE),
      getVulnDetails: this.getVulnDetails,
      getLicenseDetails: this.getLicenseDetails,
      getRemediationDetails: this.getRemediationDetails
    };
  }

  getStorageValue = (key: string, defaultValue: any): Promise<any> => {
    return new Promise((resolve) => {
      _browser.storage.local.get((items: {[key: string]: any}) => {
        if (items[key]) {
          resolve(items[key]);
        } else {
          resolve(defaultValue);
        }
      });
    });
  };

  _setupRequestService = async (): Promise<void> => {
    if (!this._requestService) {
      const scanType = await this.getStorageValue('scanType', DATA_SOURCES.OSSINDEX);
      const logLevel = await this.getStorageValue('logLevel', LogLevel.ERROR);
      (this.state.logger as BrowserExtensionLogger).setLevel(logLevel);

      this.setState({scanType: scanType});

      this.state.logger.logMessage('Scantype found', LogLevel.TRACE, scanType);

      try {
        if (scanType === DATA_SOURCES.NEXUSIQ) {
          this.state.logger.logMessage('Fetching IQ Server settings', LogLevel.INFO);
          const host = await this.getStorageValue('iqServerURL', undefined);
          const user = await this.getStorageValue('iqServerUser', undefined);
          const token = await this.getStorageValue('iqServerToken', undefined);
          const application = await this.getStorageValue('iqServerApplication', undefined);
          this.state.logger.logMessage('IQ Server Settings fetched', LogLevel.INFO);

          this.state.logger.logMessage('Setting up IQ Request Service', LogLevel.INFO);
          this._requestService = new IqRequestService({
            host: host,
            user: user,
            token: token,
            application: application,
            browser: true,
            logger: this.state.logger,
            product: 'chrome-extension',
            version: '1.0.0'
          });

          return;
        } else {
          this.state.logger.logMessage('Setting up OSS Index request service', LogLevel.INFO);
          const ossIndexUser = await this.getStorageValue('ossIndexUser', undefined);
          const ossIndexToken = await this.getStorageValue('ossIndexToken', undefined);

          this._requestService = new OSSIndexRequestService(
            {
              user: ossIndexUser,
              token: ossIndexToken,
              browser: true,
              product: 'chrome-extension',
              version: '1.0.0',
              logger: this.state.logger
            },
            localforage as any
          );

          return;
        }
      } catch (err: any) {
        this.setState({errorMessage: err.message});
        return;
      }
    }
  };

  componentDidMount = (): void => {
    chrome.tabs.query({active: true, currentWindow: true}).then((tabs) => {
      if (tabs[0]) {
        const repoType: RepoType | undefined = findRepoType(tabs[0].url!);
        console.info('Found repoType' + repoType.repoFormat);
        this.state.logger.logMessage('Found repoType', LogLevel.TRACE, repoType);

        if (repoType && tabs[0].id) {
          console.info('sendMessage: ' + repoType.repoID + ' : ' + tabs[0].url);
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              type: 'getArtifactDetailsFromWebpage',
              url: tabs[0].url,
              repoTypeInfo: repoType
            },
            this.handleResponse
          );
        }
      }
    });
  };

  getCSRFTokenFromCookie = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      chrome.cookies.getAll({name: 'CLM-CSRF-TOKEN'}, (cookies) => {
        if (cookies && cookies.length > 0) {
          resolve(cookies[0].value);
        } else {
          reject('No valid cookie found');
        }
      });
    });
  };

  getVulnDetails = async (vulnId: string): Promise<void> => {
    // Likely ok to skip setting the CSRF etc... because if this is getting requested, we know it's been set
    this.state.logger.logMessage(
      'Attempting to get details for vulnerability',
      LogLevel.TRACE,
      vulnId
    );
    const vulnDetails = await (this._requestService as IqRequestService).getVulnerabilityDetails(
      vulnId
    );

    this.state.logger.logMessage('Obtained detail for vulnerability', LogLevel.TRACE, vulnDetails);

    this.setState({vulnDetails: vulnDetails});
  };

  getLicenseDetails = async (purl: string): Promise<void> => {
    // Likely ok to skip setting the CSRF etc... because if this is getting requested, we know it's been set
    if (this._requestService instanceof IqRequestService) {
      this.state.logger.logMessage(
        'Attempting to get license legal details for component',
        LogLevel.TRACE,
        purl
      );
      const packageUrl = PackageURL.fromString(purl);
      const licenseDetails = await (
        this._requestService as IqRequestService
      ).getLicenseLegalComponentReport(packageUrl);

      this.state.logger.logMessage(
        'Obtained license legal detail for component',
        LogLevel.TRACE,
        licenseDetails
      );

      this.setState({licenseDetails: licenseDetails});
      return;
    }
    return;
  };

  getAllVersions = async (purl: string): Promise<void> => {
    const packageUrl = PackageURL.fromString(purl);

    this.state.logger.logMessage(
      'Attempting to get all Versions for component',
      LogLevel.TRACE,
      packageUrl
    );

    const allVersions = await (this._requestService as IqRequestService).getVersionsForComponent(
      packageUrl
    );

    this.state.logger.logMessage('Obtained all versions for component', LogLevel.INFO, allVersions);

    const allVersionsDetails: ComponentDetails[] = [];
    // const allVersionsPurl: PackageURL[] = [];
    //
    // for (let i = 0; i < allVersions.length; i++) {
    //   if (allVersions[i]) {
    //     newPurl = PackageURL.fromString(purl);
    //     newPurl.version = allVersions[i];
    //     allVersionsPurl.push(newPurl);
    //   }
    // }
    // console.log('allVersionsPurl length: ' + allVersionsPurl.length);
    let purlComponentDetails: ComponentDetails;
    let newPurl: PackageURL;
    try {
      const allVersionsPurlRequest: PackageURL[] = [];
      allVersions.forEach((version) => {
        newPurl = PackageURL.fromString(purl);
        newPurl.version = version;
        allVersionsPurlRequest.push(newPurl);
      });
      console.log('allVersionsPurlRequest length should be:  ' + allVersions.length);
      console.log('allVersionsPurlRequest length:  ' + allVersionsPurlRequest.length);
      purlComponentDetails = await (this._requestService as IqRequestService).getComponentDetails(
        allVersionsPurlRequest
      );
      console.log(
        'purlComponentDetails.componentDetails length: ' +
          purlComponentDetails.componentDetails.length
      );
      console.log(purlComponentDetails);
      console.log(purlComponentDetails.componentDetails);
      this.setState({componentVersionsDetails: purlComponentDetails.componentDetails});
    } catch (err: any) {
      console.log('Unable to get component details for: ' + packageUrl.toString());
    }

    this.setState({componentVersions: allVersions});
  };

  getRemediationDetails = async (purl: string): Promise<void> => {
    const packageUrl = PackageURL.fromString(purl);

    this.state.logger.logMessage(
      'Attempting to get remediation details',
      LogLevel.TRACE,
      packageUrl
    );

    const remediationDetails = await (
      this._requestService as IqRequestService
    ).getComponentRemediation(packageUrl);

    this.state.logger.logMessage(
      'Obtained remediation details',
      LogLevel.TRACE,
      remediationDetails
    );

    this.setState({remediationDetails: remediationDetails});
  };

  handleResponse = async (purlString: string): Promise<void> => {
    this.state.logger.logMessage('Setting up request service', LogLevel.INFO);
    console.info('Setting up request service');

    this._setupRequestService()
      .then(async () => {
        this.state.logger.logMessage('Finished setting up request service', LogLevel.INFO);
        console.info('Finished setting up request service', LogLevel.INFO);

        console.info('purl: fixin to get purl: ', purlString);
        const purl = PackageURL.fromString(purlString);
        this.setState({currentVersion: purl});

        this.state.logger.logMessage('Parsed purl into object', LogLevel.TRACE, purl);
        console.info('Parsed purl into object', LogLevel.TRACE, purl);

        if (this._requestService instanceof IqRequestService) {
          this.state.logger.logMessage('Attempting to login to Nexus IQ Server', LogLevel.INFO);
          console.info('Attempting to login to Nexus IQ Server', LogLevel.INFO);
          const loggedIn = await this._requestService.loginViaRest();
          this.state.logger.logMessage('Logged in to Nexus IQ Server', LogLevel.TRACE, loggedIn);
          console.info('Logged in to Nexus IQ Server', LogLevel.TRACE, loggedIn);

          this.getCSRFTokenFromCookie()
            .then(async (token) => {
              (this._requestService as IqRequestService).setXCSRFToken(token);
              const status = await (
                this._requestService as IqRequestService
              ).getComponentEvaluatedAgainstPolicy([purl]);

              (this._requestService as IqRequestService).asyncPollForResults(
                `/${status.resultsUrl}`,
                (e) => {
                  throw new Error(e);
                },
                (results) => {
                  this.state.logger.logMessage(
                    'Got results from Nexus IQ Server for Component Policy Eval',
                    LogLevel.TRACE,
                    {
                      results: results
                    }
                  );
                  console.info('Got results from Nexus IQ Server for Component Policy Eval');
                  this.setState({policyDetails: results});

                  this.getAllVersions(purlString);
                }
              );
            })
            .catch((err: any) => {
              this.state.logger.logMessage(err, LogLevel.ERROR);
              console.info('ERROR: ', err);
              this.setState({errorMessage: err.message});
            });
        } else {
          this.doRequestForComponentDetails(purl);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  doRequestForComponentDetails = (purl: PackageURL) => {
    console.log('doRequestForComponentDetails: ' + purl);
    if (this._requestService) {
      this._requestService
        .getComponentDetails([purl])
        .then((res: ComponentDetails) => {
          if (res) {
            this.setState({componentDetails: res.componentDetails[0]});
          }
        })
        .catch((err: any) => {
          console.log(err);
          this.state.logger.logMessage(err, LogLevel.ERROR);
          this.setState({errorMessage: err.message});
        });
    }
  };

  render(): JSX.Element {
    return (
      <NexusContext.Provider value={this.state}>
        <div className="nx-page-content">
          <main className="nx-page-main nx-viewport-sized">
            <Popup />
          </main>
        </div>
      </NexusContext.Provider>
    );
  }
}

export default NexusChromeExtensionContainer;
