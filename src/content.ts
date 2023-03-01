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
import $, {Cash} from 'cash-dom';
import {ArtifactMessage} from './types/ArtifactMessage';
import {getArtifactDetailsFromDOM} from './utils/PageParsing';
import {findRepoType} from './utils/UrlParsing';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
chrome.runtime.onMessage.addListener((event: any, sender, respCallback) => {
  console.info('Received a message on content.js', event);
  if (event.type === 'changedURLOnPage') {
    console.debug('Received changedURLOnPage message on content.js');
    checkPage();
  }
  if (event.type === 'getArtifactDetailsFromWebpage') {
    console.info('Received getArtifactDetailsFromWebpage message on content.js');
    const data: ArtifactMessage = event;
    console.info('Message says to get some artifact details from the webpage, will do boss!', data);

    const purl = getArtifactDetailsFromDOM(data.repoTypeInfo, data.url);

    if (purl) {
      console.info('Got a purl back from scraping url or webpage', purl);

      respCallback(purl.toString());
    }
  }
  if (event.type === 'artifactDetailsFromServiceWorker') {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (event.componentDetails) {
      const data: ComponentDetails = event.componentDetails;
      // const policyData: PolicyData = event.policyData;
      //
      // console.log('Policy Details', policyData);
      const loc = window.location.href;
      const element = findElement(loc);
      removeClasses(element);
      if (
        // data.componentDetails[0] &&
        data.componentDetails[0].securityData &&
        // data.componentDetails[0].securityData.securityIssues &&
        data.componentDetails[0].securityData.securityIssues.length > 0
      ) {
        const maxSeverity = Math.max(
          ...data.componentDetails[0].securityData.securityIssues.map((issue) => {
            return issue.severity;
          })
        );

        let vulnClass = 'sonatype-iq-extension-vuln-low';
        if (maxSeverity >= 9) {
          vulnClass = 'sonatype-iq-extension-vuln-severe';
        } else if (maxSeverity >= 7) {
          vulnClass = 'sonatype-iq-extension-vuln-high';
        } else if (maxSeverity >= 5) {
          vulnClass = 'sonatype-iq-extension-vuln-med';
        } else if (maxSeverity >= 2) {
          vulnClass = 'sonatype-iq-extension-vuln-low';
        }
        addClasses(vulnClass, element);
      }
    }
  }
});

const removeClasses = (element) => {
  //remove the class
  console.info('removing classes', element);
  element.removeClass('sonatype-iq-extension-vuln');
  element.removeClass('sonatype-iq-extension-vuln-severe');
  element.removeClass('sonatype-iq-extension-vuln-high');
  element.removeClass('sonatype-iq-extension-vuln-low');
};

const checkPage = () => {
  const repoType = findRepoType(window.location.href);

  if (repoType) {
    chrome.runtime.sendMessage({type: 'togglePage', show: true});
    console.debug('Found a valid repoType: ' + repoType);
    const purl = getArtifactDetailsFromDOM(repoType, window.location.href);

    if (purl) {
      console.debug('Obtained a valid purl: ' + purl);
      chrome.runtime.sendMessage({type: 'getArtifactDetailsFromPurl', purl: purl.toString()});
    }
  } else {
    chrome.runtime.sendMessage({type: 'togglePage', show: false});
  }
};

checkPage();

function findElement(loc: string) {
  console.info('findElement', loc);
  const repoType = findRepoType(loc);
  if (repoType) {
    const element = $(repoType.titleSelector);
    if (element.length > 0) {
      return element;
    }
  }
  return undefined;
}
function addClasses(vulnClass: string, element?: Cash) {
  console.info('addClasses', vulnClass, element);
  if (element) {
    element.addClass(vulnClass);
    element.addClass('sonatype-iq-extension-vuln');
  }
}
