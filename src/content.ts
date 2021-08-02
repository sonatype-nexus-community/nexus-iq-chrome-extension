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

import {ArtifactMessage} from './types/ArtifactMessage';
import {getArtifactDetailsFromDOM} from './utils/PageParsing';
import {findRepoType} from './utils/UrlParsing';

chrome.runtime.onMessage.addListener((event: any, sender, respCallback) => {
  console.info('Recieved a message on content.js', event);

  if (event.type === 'getArtifactDetailsFromWebpage') {
    const data: ArtifactMessage = event;
    console.info('Message says to get some artifact details from the webpage, will do boss!');

    const purl = getArtifactDetailsFromDOM(data.repoTypeInfo, data.url);

    if (purl) {
      console.info('Got a purl back from scraping url or webpage', purl);

      respCallback(purl.toString());
    }
  }
  if (event.type === 'artifactDetailsFromServiceWorker') {
    console.log(event);
  }
});

const checkPage = () => {
  const repoType = findRepoType(window.location.href);

  if (repoType) {
    console.debug('Found a valid repoType: ' + repoType);
    const purl = getArtifactDetailsFromDOM(repoType, window.location.href);

    if (purl) {
      console.log('Obtained a valid purl: ' + purl);
      chrome.runtime.sendMessage({type: 'getArtifactDetailsFromPurl', purl: purl.toString()});
    }
  }
};

checkPage();
