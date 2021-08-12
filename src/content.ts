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

import {ComponentDetails} from '@sonatype/js-sona-types';
import {ArtifactMessage} from './types/ArtifactMessage';
import {getArtifactDetailsFromDOM} from './utils/PageParsing';
import {findRepoType} from './utils/UrlParsing';
import $ from 'cash-dom';

chrome.runtime.onMessage.addListener((event: any, sender, respCallback) => {
  console.info('Recieved a message on content.js', event);

  if (event.type === 'changedURLOnPage') {
    console.trace('Recieved changedURLOnPage message on content.js');
    console.trace(event.url);
    checkPage();
  }
  if (event.type === 'getArtifactDetailsFromWebpage') {
    console.trace('Received getArtifactDetailsFromWebpage message on content.js');
    const data: ArtifactMessage = event;
    console.info('Message says to get some artifact details from the webpage, will do boss!', data);

    const purl = getArtifactDetailsFromDOM(data.repoTypeInfo, data.url);

    if (purl) {
      console.info('Got a purl back from scraping url or webpage', purl);

      respCallback(purl.toString());
    }
  }
  if (event.type === 'artifactDetailsFromServiceWorker') {
    console.trace('Recieved artifactDetailsFromServiceWorker message on content.js');
    if (event.componentDetails) {
      const data: ComponentDetails = event.componentDetails;

      if (
        data.componentDetails[0] &&
        data.componentDetails[0].securityData &&
        data.componentDetails[0].securityData.securityIssues &&
        data.componentDetails[0].securityData.securityIssues.length > 0
      ) {
        const maxSeverity = Math.max(
          ...data.componentDetails[0].securityData.securityIssues.map((issue) => {
            return issue.severity;
          })
        );

        let vulnClass = 'vuln-low';
        if (maxSeverity >= 9) {
          vulnClass = 'vuln-severe';
        } else if (maxSeverity >= 7) {
          vulnClass = 'vuln-high';
        } else if (maxSeverity >= 5) {
          vulnClass = 'vuln-med';
        } else if (maxSeverity >= 2) {
          vulnClass = 'vuln-low';
        }
        const repoType = findRepoType(window.location.href);
        if (repoType) {
          const selector = $(repoType.titleSelector);
          if (selector && selector.length > 0) {
            selector.addClass(vulnClass);
            selector.addClass('vuln');
          }
        }
      }
    }
  }
});

const checkPage = () => {
  const repoType = findRepoType(window.location.href);

  if (repoType) {
    chrome.runtime.sendMessage({type: 'togglePage', show: true});
    console.debug('Found a valid repoType: ' + repoType);
    const purl = getArtifactDetailsFromDOM(repoType, window.location.href);

    if (purl) {
      console.debug('Obtained a valid purl: ' + purl);
      console.trace('Attempting to send message to service worker');
      chrome.runtime.sendMessage({type: 'getArtifactDetailsFromPurl', purl: purl.toString()});
      console.trace('Message sent to service worker');
    }
  } else {
    chrome.runtime.sendMessage({type: 'togglePage', show: false});
  }
};

checkPage();
