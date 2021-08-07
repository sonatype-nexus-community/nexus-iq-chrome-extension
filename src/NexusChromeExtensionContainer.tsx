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
  TestLogger,
  IqRequestService,
  RequestService,
  ComponentDetails
} from '@sonatype/js-sona-types';
import {PackageURL} from 'packageurl-js';
import localforage from 'localforage';

const _browser = chrome ? chrome : browser;

type AppProps = {};

class NexusChromeExtensionContainer extends React.Component<AppProps, NexusContextInterface> {
  private _requestService: RequestService | undefined;

  constructor(props: AppProps) {
    super(props);

    this.state = {
      errorMessage: undefined,
      scanType: DATA_SOURCES.OSSINDEX
    };
  }

  getStorageValue = (
    key: string,
    defaultValue: string | undefined
  ): Promise<string | undefined> => {
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

      this.setState({scanType: scanType});

      console.trace('Scantype found', scanType);

      try {
        if (scanType === DATA_SOURCES.NEXUSIQ) {
          console.info('Fetching IQ Server settings');
          const host = await this.getStorageValue('iqServerURL', undefined);
          const user = await this.getStorageValue('iqServerUser', undefined);
          const token = await this.getStorageValue('iqServerToken', undefined);
          const application = await this.getStorageValue('iqServerApplication', undefined);
          console.info('IQ Server Settings fetched');

          console.trace('Setting up IQ Request Service');
          this._requestService = new IqRequestService({
            host: host,
            user: user,
            token: token,
            application: application,
            browser: true,
            logger: new TestLogger(),
            product: 'chrome-extension',
            version: '1.0.0'
          });

          return;
        } else {
          console.trace('Setting up OSS Index request service');
          const ossIndexUser = await this.getStorageValue('ossIndexUser', undefined);
          const ossIndexToken = await this.getStorageValue('ossIndexToken', undefined);

          this._requestService = new OSSIndexRequestService(
            {
              user: ossIndexUser,
              token: ossIndexToken,
              browser: true,
              product: 'chrome-extension',
              version: '1.0.0',
              logger: new TestLogger()
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

        console.info('Found repoType', repoType);

        if (repoType && tabs[0].id) {
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
    const vulnDetails = await (this._requestService as IqRequestService).getVulnerabilityDetails(
      vulnId
    );

    this.setState({vulnDetails: vulnDetails});
  };

  getLicenseDetails = async (purl: string): Promise<void> => {
    // Likely ok to skip setting the CSRF etc... because if this is getting requested, we know it's been set
    const packageUrl = PackageURL.fromString(purl);
    const licenseDetails = await (this
      ._requestService as IqRequestService).getLicenseLegalComponentReport(packageUrl);

    this.setState({licenseDetails: licenseDetails});
  };

  handleResponse = async (purlString: string): Promise<void> => {
    console.info('Setting up request service');
    this._setupRequestService()
      .then(async () => {
        console.info('Finished setting up request service');

        const purl = PackageURL.fromString(purlString);
        console.trace('Parsed purl into object', purl);

        if (this._requestService instanceof IqRequestService) {
          console.info('Attempting to login to Nexus IQ Server');
          const loggedIn = await this._requestService.loginViaRest();
          console.info('Logged in to Nexus IQ Server: ' + loggedIn);

          this.getCSRFTokenFromCookie()
            .then(async (token) => {
              (this._requestService as IqRequestService).setXCSRFToken(token);
              const status = await (this
                ._requestService as IqRequestService).getComponentEvaluatedAgainstPolicy([purl]);

              (this._requestService as IqRequestService).asyncPollForResults(
                `/${status.resultsUrl}`,
                (e) => {
                  throw new Error(e);
                },
                (results) => {
                  console.trace('Got results from Nexus IQ Server for Component Policy Eval', {
                    results: results
                  });
                  this.setState({policyDetails: results});
                }
              );
            })
            .catch((err: any) => {
              console.error(err);
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
    if (this._requestService) {
      this._requestService
        .getComponentDetails([purl])
        .then((res: ComponentDetails) => {
          if (res) {
            this.setState({componentDetails: res.componentDetails[0]});
          }
        })
        .catch((err: any) => {
          console.error(err);
          this.setState({errorMessage: err.message});
        });
    }
  };

  render(): JSX.Element {
    return (
      <NexusContext.Provider value={this.state}>
        <div className="nx-page-content">
          <main className="nx-page-main nx-viewport-sized">
            <Popup
              getVulnDetails={this.getVulnDetails}
              getLicenseDetails={this.getLicenseDetails}
            />
          </main>
        </div>
      </NexusContext.Provider>
    );
  }
}

export default NexusChromeExtensionContainer;
