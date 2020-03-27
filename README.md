# Chrome Extension for Sonatype Nexus IQ

[![DepShield Badge](https://depshield.sonatype.org/badges/ctownshend/chrome-extension-nexus-iq/depshield.svg)](https://depshield.github.io) [![CircleCI](https://circleci.com/gh/sonatype-nexus-community/nexus-iq-chrome-extension.svg?style=svg)](https://circleci.com/gh/sonatype-nexus-community/nexus-iq-chrome-extension)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Table of Contents

- [Purpose](#purpose)
- [Data](#data)
- [Usage](#usage)
- [Examples](#examples)
- [Installation](#installation)
- [Fine Print](#The-Fine-Print)

## Purpose

To allow you to inspect a package before you download it. The plugin requires a valid [Sonatype Nexus Lifecycle](https://www.sonatype.com/nexus-lifecycle) instance, which means you must be licensed to use this plugin.
The plugin can scan packages at the following repositories:

1. Java - maven - https://search.maven.org/
2. Java - maven - https://mvnrepository.com/
3. JS/Node - npm - https://www.npmjs.com/
4. .Net - nuget - https://www.nuget.org/
5. Ruby - rubygems - https://rubygems.org/
6. Python - pypi - https://pypi.org/
7. php - packagist/composer/ - https://packagist.org/
8. R - CRAN - https://cran.r-project.org/
9. Rust - Crates- https://crates.io/
10. Golang - Go - https://search.gocenter.io/
11. Github - any language - https://github.com/jquery/jquery/releases/tag/1.11.1
12. Nexus Proxy Repos - supported repository formats are maven2, npm, rubygems and nuget e.g. http://nexus:8081/#browse/browse:maven-central:commons-collections%2Fcommons-collections%2F3.2.1
13. Artifactory Proxy Repos - supported repository formats are maven2 and npm e.g. https://repo.spring.io/webapp/#/artifacts/browse/tree/General/npmjs-cache/parseurl/-/parseurl-1.0.1.tgz
14. Artifactory Repo lists - e.g. https://repo.spring.io/list/jcenter-cache/org/cloudfoundry/cf-maven-plugin/1.1.3/
15. Maven Repo1 - https://repo1.maven.org/maven2/
16. Maven Repo2 - http://repo.maven.org/maven2/

## Documentation

[Sonatype Nexus Lifecycle nexus-iq-chrome-extension](https://sonatype-nexus-community.github.io/nexus-iq-chrome-extension/)

## Data

The data is sourced from Sonatype Nexus Lifecycle's IQ Server, which accesses the Sonatype Data Services for those supported ecosystems, currently 1-6 & 12-13. Systems 7-11 get their data from Sonatype OSSIndex ( https://ossindex.sonatype.org/ ).

## Usage

When you browse to a website that is covered by the tool, such as maven central and click on the plugin, it will open with the Sonatype Lifecycle data relevant to that library.
<img src="images/PluginRun.gif" alt="Open Plugin" width="300"/>
<br/>

1. The install will create a new icon in your Chrome Browser next to the location box.
   <img src="images/Extensions_Icon_created.png" alt="Extensions Icon Created" width="300"/>
   <br/>
2. The plugin will work on any page that matches the URL list above.
   <br/>
3. Navigate to one of the pages that the extension is compatible with (see the detailed list below).
   <br/>
4. Click on the Blue Sonatype Logo...
   <img src="images/Extension_lodash_-_npm_4.17.9.png" alt="Extension Lodash 4.17.9" width="300"/>
   <br/>
   4.1 ...The solution will think for a second and show the Sonatype hexagon log while it retrieves the data...Then show the Data.
   <img src="images/Extension_thinking_icon.png" alt="Extension Thinking Icon" width="300"/>
   <br/>
5. Component Information
   <img src="images/Extension_Component_info.png" alt="Extension Componen Info" width="300"/>
   <br/>
6. Security Information
   The security data is presented in a list with clickable sections for each vulnerability.
   <img src="images/Extension_Security.png" alt="Extension Security List" width="300"/>
   <br/>
7. Security Details
   The security details for each vulnerability is available. Click on the reference to display the security details.
   <img src="images/Extension_Vulnerability_Detail.png" alt="Extension Vulnerability Detail" width="300"/>
   <br/>
8. Remediation
   The version history is available for each component.
   <img src="images/Extension_VersionHistoryGraph.png" alt="Extension Version History" width="300"/>
   <br/>
9. Remediation Guidance
   The remediation guidance API has been added. The recommended fix version will be listed at the top of the screen.
   <br/>
10. License Information
    <img src="images/Extension_Licensing.png" alt="Extension Licensing" width="300"/>
    <br/>
11. Unsupported page.
    If you click on an unsupported page then the following screen will appear.
    <img src="images/unsupported_page.png" alt="Unsupported Page" width="300"/>
    <br/>

## Examples

The list of pages that are supported are here.

### Java - maven

Pattern - `https://search.maven.org/artifact/<group>/<artifact>/<version>/<extension>`
<br/>e.g. <https://search.maven.org/artifact/org.apache.struts/struts2-core/2.3.30/jar>

Pattern -`https://mvnrepository.com/artifact/<group>/<artifact>/<version>`
<br/>e.g. <https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1>

Pattern - `https://repo1.maven.org/maven2/<group>/<artifact>/<version>/`
<br/> e.g. <https://repo1.maven.org/maven2/commons-collections/commons-collections/3.2.1/>

Pattern - `http://repo2.maven.org/maven2/<group>/<artifact>/<version>/`
<br/> e.g. <http://repo2.maven.org/maven2/commons-collections/commons-collections/3.2.1/>

### JS/Node - npm

Pattern - `https://www.npmjs.com/package/<package>`
<br/>e.g. <https://www.npmjs.com/package/lodash/>
<br/>and
<br/>Pattern - `https://www.npmjs.com/package/<package>/v/<version>`
<br/>e.g. <https://www.npmjs.com/package/lodash/v/4.17.9>

### DotNet - nuget

Pattern - `https://www.nuget.org/packages/<package>/<version>`
<br/>e.g. <https://www.nuget.org/packages/LibGit2Sharp/0.20.1>

### Ruby - rubygems

Pattern - `https://rubygems.org/gems/<package>`
<br/>e.g. <https://rubygems.org/gems/bundler>

### Python - pypi

Pattern - `https://pypi.org/<package>/`
<br/>e.g. <https://pypi.org/project/Django/>
<br/>or Pattern - `https://pypi.org/<package>/<version>/`
<br/>e.g. <https://pypi.org/project/Django/1.6/>

### php - packagist/composer/

Pattern - `https://packagist.org/`
<br/>e.g. <https://packagist.org/packages/drupal/drupal>

### R - CRAN

Pattern - `https://cran.r-project.org/`
<br/>e.g. <https://cran.r-project.org/web/packages/A3/index.html>

### Rust - Crates

Pattern - `https://crates.io/`
<br/>e.g. <https://crates.io/crates/random>

### Golang - Gocenter

`https://search.gocenter.io/`
<br/>e.g. <https://search.gocenter.io/github.com~2Fetcd-io~2Fetcd/versions>

### Github - any language supported by OSSIndex but only supports the releases tag at this stage

<https://github.com/jquery/jquery/releases/tag/1.11.1>

### NexusRepo - npm, maven2 and rubygems

e.g. <http://nexus:8081/#browse/browse:rubygems-proxy:nexus%2F1.4.0%2Fnexus-1.4.0.gem>

## Installation

1. Download the plugin from GitHub
`git clone https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension.git`
2. Open Chrome Browser.
3. Click on the three dots, then More Tools, then Extensions.
<br/>
<img src="images/Extensions.png" alt="drawing" width="300"/>
<br/>
4. Click on load unpacked (requires "Developer Mode" to be enabled).
<img src="images/Extension_Develop_Mode.png" alt="drawing" width="300"/>
<br/>
<img src="images/Extensions_Load_upacked.png" alt="drawing" width="300"/>
<br/>
5. Navigate to the folder where you downloaded the plugin from GitHub onto your local machine.
<br/>
<img src="images/Extensions_Choose_Folder.png" alt="drawing" width="300"/>
<br/>
6. You will be prompted to enter your login details. (Important: Please note that this version stores your details in plain text in Chrome Storage. We are investigated secure storage but at this time we do not support it.)
<br/>
<img src="images/Extensions_Empty_login.png" alt="drawing" width="300"/>
<br/>
7. Select an Application to link to this plugin. The application is required to perform the advanced history and remediation scanning now available.
<br/>
<img src="images/Extension_Application_List.png" alt="drawing" width="300"/>
<br/>
8. Click Save to save your credentials.
<br/>


1. Navigate to Chrome store
2. Search for Sonatype

- Link is <https://chrome.google.com/webstore/detail/sonatype-nexus-iq-evaluat/mjehedmoboadebjmbmobpedkdgenmlhd>

3. Click `Add to Chrome`

Note: You will be asked to "Add Sonatype Nexus IQ Extension". Click "Add extension"

4. You will be prompted to enter your login details. (Important: Please note that this version stores your details in plain text in Chrome Storage. We are investigated secure storage but at this time we do not support it. You can use a token for your password though. <https://help.sonatype.com/iqserver/managing/user-management/user-tokens>)
   <br/>
   <img src="images/Extensions_Empty_login.png" alt="drawing" width="300"/>
   <br/>
5. Select an Application to link to this plugin. The application is required to perform the advanced history and remediation scanning now available.
   <br/>
   <img src="images/Extension_Application_List.png" alt="drawing" width="300"/>
   <br/>
6. Click Save to save your credentials.
   <br/>

7. You will be advised that your details are saved. Click Close when you are done and You will be taken back to the Extensions Install screen in Chrome. Close the screen and begin using.
8. The installer will have created a new icon in your Chrome Menu Bar.
   <br/>
   <img src="images/Extensions_Icon_created.png" alt="drawing" width="300"/>
   <br/>

### Uninstall

If you do not want to use the extension then you can right click on the icon and choose Remove from Chrome
<br/>
<img src="images/Extension_Disabled.png" alt="drawing" width="300"/>
<br/>

### Version History

No longer documented here. Go to the changelog

## The Fine Print

It is worth noting that this is **NOT SUPPORTED** by Sonatype, and is a contribution of ours
to the open source community (read: you!)

Remember:


### Version History
#### Version 1.7.7
* Bug fix whereby sometimes the Waiting page would sit there for ever. Due to content script not being injected. Seems the content script is always injected now as I inject it with code rather than in the manifest.json declaration

#### Version 1.7.6
* Release fixes

#### Version 1.7.5
* Added README.md

#### Version 1.7.4-Styling
* Styling of User interface



#### Version 1.7.3-All URLS
* Supports running IQ Server on any URL
* Fixed various bugs

#### Version 1.7.2-added new formats
* added new formats
* Fixed various bugs
* Added unit tests

##### Formats/package manager pages supported as of 1.7.2
* Java - maven - https://search.maven.org/
* Java - maven - https://mvnrepository.com/
* JS/Node - npm - https://www.npmjs.com/
* .Net - nuget - https://www.nuget.org/
* Ruby - rubygems - https://rubygems.org/
* Python - pypi - https://pypi.org/
* php - packagist/composer/ -  https://packagist.org/
* R - CRAN -  https://cran.r-project.org/
* Rust - Crates-  https://crates.io/
* Golang - Go - https://gocenter.jfrog.com/

#### Version 1.7.1 - Fixed popup
* Fixed popup logic bug. 
* Began adding testing


#### Version 1.7 - initial release
Complete rewrite to fix cookie problem with calling Nexus IQ Server.
I have decided the best way to fix the security issues for now is to limit access to http://iq-server:8070. 
So you will have to alias your localhost as iq-server in your /etc/hosts/ file to use this plugin for now.
I will think about a change which gives access to all URLS like so below

Add `*://*/*` to permissions section like so

`"permissions": [
    "*://*/*",
 `   
    
This would then mean you would not need to alias Nexus IQ.

Supports scanning components in the following repos
* https://search.maven.org/
* https://mvnrepository.com/
* https://www.npmjs.com/
* https://www.nuget.org/
* https://rubygems.org/
* https://pypi.org/
* https://packagist.org/

- Use this contribution at the risk tolerance that you have
- Do NOT file Sonatype support tickets related to `chrome-extension` support in regard to this project
- DO file issues here on GitHub, so that the community can pitch in

Phew, that was easier than I thought. Last but not least of all:

Have fun creating and using `chrome-extension`, we are glad to have you here!

