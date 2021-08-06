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

const Install = (): JSX.Element => {
  const render = () => {
    return (
      <React.Fragment>
        <h1>Hello! Thanks for installing the Sonatype Nexus Chrome Extension!</h1>
        <p>
          First first things first (is that second?) maybe you want to{' '}
          <a href={`options.html?help`}>check out the Help page</a> to see if there is some
          information you&apos;d like to know before you get started!
        </p>
        <p>First things first, you&apos;ll likely want to set your Options up.</p>
        <h3>OPTIONS</h3>
        <p>
          <a href={`options.html`}>Click here to setup your options!</a>
        </p>
      </React.Fragment>
    );
  };

  return render();
};

export default Install;
