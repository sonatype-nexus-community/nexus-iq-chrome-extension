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
import {VulnerabilityDetails} from '@sonatype/react-shared-components/components/NxVulnerabilityDetails/types';
import {rejects} from 'assert';

const _browser = chrome ? chrome : browser;

type AppProps = {};

class NexusChromeExtensionContainer extends React.Component<AppProps, NexusContextInterface> {
  private _requestService: RequestService | undefined;

  constructor(props: AppProps) {
    super(props);

    _browser.storage.local.get((items: {[key: string]: any}) => {
      if (items['scanType']) {
        const scanType = items['scanType'];

        if (scanType === DATA_SOURCES.NEXUSIQ) {
          this._requestService = new IqRequestService({
            host: items['iqServerURL'],
            user: items['iqServerUser'],
            token: items['iqServerToken'],
            application: items['iqServerApplication'],
            browser: true,
            logger: new TestLogger(),
            product: 'chrome-extension',
            version: '1.0.0'
          });

          this.setState({scanType: scanType, componentDetails: undefined});

          return;
        } else {
          const ossIndexUser = items['ossIndexUser'];
          const ossIndexToken = items['ossIndexToken'];

          if (ossIndexUser && ossIndexToken) {
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
          } else {
            this._requestService = new OSSIndexRequestService(
              {
                browser: true,
                product: 'chrome-extension',
                version: '1.0.0',
                logger: new TestLogger()
              },
              localforage as any
            );
          }
        }

        this.setState({
          scanType: scanType ? scanType : DATA_SOURCES.OSSINDEX,
          componentDetails: undefined
        });
      }
    });
  }

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
    const vulnDetails = await (this._requestService as IqRequestService).getVulnerabilityDetails(
      vulnId
    );

    this.setState({vulnDetails: vulnDetails});
  };

  handleResponse = async (purlString: string): Promise<void> => {
    const purl = PackageURL.fromString(purlString);

    if (this._requestService instanceof IqRequestService) {
      const loggedIn = await this._requestService.loginViaRest();
      console.log('Logged in to Nexus IQ Server: ' + loggedIn);

      this.getCSRFTokenFromCookie()
        .then((token) => {
          console.log('CSRF Token: ' + token);
          (this._requestService as IqRequestService).setXCSRFToken(token);
          this.doRequestForComponentDetails(purl);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      this.doRequestForComponentDetails(purl);
    }
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
        });
    }
  };

  render(): JSX.Element {
    return (
      <NexusContext.Provider value={this.state}>
        <div className="nx-page-content">
          <main className="nx-page-main nx-viewport-sized">
            <Popup getVulnDetails={this.getVulnDetails} />
          </main>
        </div>
      </NexusContext.Provider>
    );
  }
}

export default NexusChromeExtensionContainer;
