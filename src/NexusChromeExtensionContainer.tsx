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
import React, { useState } from 'react';
import Popup from './components/Popup/Popup';
import { NexusContext, NexusContextInterface } from './context/NexusContext';
import { RepoType } from './utils/Constants';
import { findRepoType } from './utils/UrlParsing';
import { IqRequestService } from './services/IqRequestService';

type AppProps = {};

class NexusChromeExtensionContainer extends React.Component<AppProps, NexusContextInterface> {
  private iqRequestService = new IqRequestService();

  constructor(props: AppProps) {
    super(props);
    this.state = {
      scanType: "",
      vulnerabilities: [],
      componentDetails: undefined
    }
  }

  componentDidMount = () => {
    chrome.tabs.query({active: true, currentWindow: true})
    .then((tabs) => {
      if (tabs[0]) {
        const repoType: RepoType | undefined = findRepoType(tabs[0].url!);

        console.info("Found repoType", repoType);
  
        chrome.tabs.sendMessage(
          tabs[0].id!, 
          {"type": "getArtifactDetailsFromWebpage", "format": repoType?.repoFormat, "url": tabs[0].url!},
          this.handleResponse
        );
      }
    })
  }

  handleResponse = (purl: string) => {
    this.iqRequestService.getComponentDetails(purl)
      .then((res) => {
        if (res.componentDetails && res.componentDetails.length > 0) {
          this.setState({ componentDetails: res.componentDetails[0] });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  render() {
    return <NexusContext.Provider value={this.state}>
      <Popup />
    </NexusContext.Provider>
  }
}

export default NexusChromeExtensionContainer;
