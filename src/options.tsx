/* eslint @typescript-eslint/no-var-requires: "off" */
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
  faArrowLeft,
  faArrowRight,
  faCog,
  faPlay,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {
  NxGlobalSidebarFooter,
  NxGlobalSidebarNavigation,
  NxGlobalSidebarNavigationLink,
  NxPageMain,
  NxStatefulGlobalSidebar
} from '@sonatype/react-shared-components';
import React from 'react';
import ReactDOM from 'react-dom';
import NexusOptionsContainer from './NexusOptionsContainer';
import * as pack from '../package.json';

const renderOptions = () => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const install = params.has('install');
  const help = params.has('help');

  ReactDOM.render(
    <React.StrictMode>
      <NxStatefulGlobalSidebar
        isDefaultOpen={true}
        toggleCloseIcon={faArrowRight as IconDefinition}
        toggleOpenIcon={faArrowLeft as IconDefinition}
        logoImg="images/nexus_lifecycle_sidebar.svg"
        logoAltText="Sonatype Nexus Browser Extension"
        logoLink="#"
      >
        <NxGlobalSidebarNavigation>
          <NxGlobalSidebarNavigationLink
            icon={faPlay as IconDefinition}
            text="Getting Started"
            href="options.html?install"
          />
          <NxGlobalSidebarNavigationLink
            icon={faQuestionCircle as IconDefinition}
            text="Help"
            href="options.html?help"
          />
          <NxGlobalSidebarNavigationLink
            icon={faCog as IconDefinition}
            text="Options"
            href="options.html"
          />
        </NxGlobalSidebarNavigation>
        <NxGlobalSidebarFooter
          supportText={`Request Support`}
          supportLink={pack.bugs.url}
          releaseText={`Release ${pack.version}`}
          productTagLine="Powered by Sonatype IQ Server & Sonatype OSS Index"
          showCreatedBy={true}
        />
      </NxStatefulGlobalSidebar>
      <NxPageMain>
        <NexusOptionsContainer install={install} help={help} />
      </NxPageMain>
    </React.StrictMode>,
    document.getElementById('ui')
  );
};

renderOptions();
