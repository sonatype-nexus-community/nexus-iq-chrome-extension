# Sonatype Platform Browser Extension

[![CircleCI](https://circleci.com/gh/sonatype-nexus-community/vscode-iq-plugin/tree/main.svg?style=shield)](https://circleci.com/gh/sonatype-nexus-community/vscode-iq-plugin/tree/main)
[![GitHub license](https://img.shields.io/github/license/sonatype-nexus-community/vscode-iq-plugin)](https://github.com/sonatype-nexus-community/vscode-iq-plugin/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/sonatype-nexus-community/vscode-iq-plugin)](https://github.com/sonatype-nexus-community/vscode-iq-plugin/issues)
[![GitHub forks](https://img.shields.io/github/forks/sonatype-nexus-community/vscode-iq-plugin)](https://github.com/sonatype-nexus-community/vscode-iq-plugin/network)
[![GitHub stars](https://img.shields.io/github/stars/sonatype-nexus-community/vscode-iq-plugin)](https://github.com/sonatype-nexus-community/vscode-iq-plugin/stargazers)

[![Available on the Chrome Webstore](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png)](https://chrome.google.com/webstore/detail/sonatype-nexus-iq-evaluat/mjehedmoboadebjmbmobpedkdgenmlhd)

## Welcome

The Sonatype Platform Browser Extension (revised name for release 2.0.0 onwards) allows Developers to get insight from Sonatype Lifecycle for Open Source packages as you browse Public Open Source Registries - i.e. before a package is even downloaded!

Version 2.x.x brings a host of changes over the 1.x.x release, and to enable us to get feedback, some features of the 1.x.x version have not yet been ported to the 2.x.x version - we'll get to these in the coming weeks and months. If you rely on features in 1.x.x - please stay on the latest 1.x.x version.

### Notable Features not yet in 2.x.x

-   Support for Sonatype OSS Index as a (free) data source
-   Some public registry formats have not yet been ported - see table below
-   Support for repositores on Sonatype Nexus Repository and jFrog Artifactory has not yet been ported - coming soon

## Format & Ecosystem Support

### Public Registries

**NOTE:** For the initial versions of 2.x.x, support for OSS Index has been removed (so we could ship quicker!) We'll update here when support is re-introduced.

| Registry                | Language            | Enabled in 2.x.x | Enabled in 1.x.x | URL                                 | Sonatype Lifecycle | Sonatype OSS Index |
| ----------------------- | ------------------- | ---------------- | ---------------- | ----------------------------------- | ------------------ | ------------------ |
| Alpine Linux            | Alpine Linux        | ✅               | ✅               | `https://pkgs.alpinelinux.org/`     | ✅                 | ❌                 |
| Anaconda                | Python              | ? TBC ?          | ✅               | `https://anaconda.org/anaconda/`    | ✅                 |                    |
| Clojars                 | Java                | ❌               | ❌               | `https://clojars.org/`              | ✅                 | ✅                 |
| CocoaPods               | Swift / Objective-C | ✅               | ✅               | `https://cocoapods.org/`            | ✅                 | ❌                 |
| Conan IO                | C / C++             | ✅               | ✅               | `https://conan.io/center/`          | ✅                 | ❌                 |
| Conda Forge             | Python              | ? TBC ?          | ✅               | `https://anaconda.org/conda-forge/` | ✅                 |                    |
| CRAN                    | R                   | ✅               | ✅               | `https://cran.r-project.org`        | ✅                 | ❌                 |
| Crates.io               | Rust                | ❌ ^2            | ✅               | `https://crates.io/`                | ✅                 | ✅                 |
| Debian Packages         | Debian Linux        | ❌ ^5            | ✅               | `https://packages.debian.org/`      | ❌                 | ✅                 |
| Debian Security Tracker | Debian Linux        | ❌ ^5            | ✅               | `https://tracker.debian.org/pkg/`   | ❌                 | ✅                 |
| Go.dev                  | Go                  | ❌ ^3            | ✅               | `https://pkg.go.dev/`               | ✅                 | ✅                 |
| Maven Central           | Java                | ✅               | ❌ ^1            | `https://central.sonatype.com/`     | ✅                 | ✅                 |
| Maven Central (simple)  | Java                | ✅               | ✅               | `https://repo.maven.apache.org/`    | ✅                 | ✅                 |
| Maven Central (simple)  | Java                | ✅               | ✅               | `https://repo1.maven.org/`          | ✅                 | ✅                 |
| Maven Central (old)     | Java                | ✅               | ✅               | `https://search.maven.org/`         | ✅                 | ✅                 |
| MVN Repository          | Java                | ✅               | ✅               | `https://mvnrepository.com/`        | ✅                 | ✅                 |
| NPM JS                  | Javascript          | ✅               | ✅               | `https://www.npmjs.com/`            | ✅                 | ✅                 |
| NuGet Gallery           | .NET                | ✅               | ✅               | `https://www.nuget.org/`            | ✅                 | ✅                 |
| Packagist               | PHP                 | ✅               | ✅               | `https://packagist.org/`            | ✅                 | ✅                 |
| PyPI                    | Python              | ✅               | ✅               | `https://pypi.org/`                 | ✅                 | ✅                 |
| RubGems                 | Ruby                | ✅               | ✅               | `https://rubygems.org/`             | ✅                 | ✅                 |
| Spring.io               | Java                | ❌ ^4            | ✅               | `https://repo.spring.io/list/`      | ✅                 | ✅                 |

_Notes:_

1. Maven Central has changed since version 1.x.x was released. Fixes not planned to be backported.
2. See issue [#237](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/issues/237)
3. See issue [#130](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/issues/130)
4. Run on a public instance of jFrog Artifactory - support coming in 2.x.x soon
5. Support has been removed and is not planned to be added back

### Private Hosted Registries

Some public registires are hosted on instances of Sonatype Nexus Repository and jFrog Artifactory. You might also have private instances.

Version 1.x.x has support for both of these types, but this has yet to be ported to version 2.x.x.

Version 1.x.x supported URLs with formats:

-   Proxy repositories in Sonatype Nexus Repository Manager – supported repository formats are maven2, npm, rubygems and nuget e.g. `http://nexus:8081/#browse/browse:maven–central:commons–collections%2Fcommons–collections%2F3.2.1`
-   Proxy repositories in jFrog Artifactory – supported repository formats are maven2 and npm e.g. `https://artifactory-server/webapp/#/artifacts/browse/tree/General/npmjs–cache/parseurl/–/parseurl–1.0.1.tgz`
-   jFrog Artifactory lists – e.g. `https://repo.spring.io/list/jcenter–cache/org/cloudfoundry/cf–maven–plugin/1.1.3/`

### Missing or unsupported Registry?

Missing format or ecosystem? Why not raise an Issue to request?

## Installation

### Installation on Chrome

Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/sonatype-nexus-iq-evaluat/mjehedmoboadebjmbmobpedkdgenmlhd) to add to Chrome.

## Configuration

## Usage

When you browse to a website that is supported by the Sonatype Platform Browser Extension, such as [Maven Central](https://central.sonatype.com/) the extension will assess the component you are viewing and alert you if there are known issues.

### Opening the Extension

###

## Development

We use Node 18 and Yarn 1.22.x.

To get started developing:

-   clone the repo
-   `yarn`
-   `yarn build`

You can run `yarn test` as well to ensure everything is setup correctly!

All source code is in `src/` and follows a fairly normal React application setup.

### Main icon

<img src="images/PluginRun.gif" alt="Open Plugin" width="300"/>
<br/>

### Remediation Guidance

![](images/Remediation.gif)

1. The install will create a new icon in your Chrome Browser next to the location box.
   <img src="images/Extensions_Icon_created.png" alt="Extensions Icon Created" width="300"/>
   <br/>
2. The plugin will work on any page that matches the URL list above.
   <br/>
3. Navigate to one of the pages that the extension is compatible with (see the detailed list below).
   <br/>
4. Click on the blue Sonatype logo...<br/>
   <img src="images/Extension_lodash_-_npm_4.17.9.png" alt="Extension Lodash 4.17.9" width="300"/>
   <br/>
   4.1 ...The solution will think for a second and show the Sonatype hexagon logo while it retrieves the data...Then show the Data.<br/>
   <img src="images/Extension_thinking_icon.png" alt="Extension Thinking Icon" width="300"/>
   <br/>
5. Component Information<br/>
   <img src="images/Extension_Component_info.png" alt="Extension Componen Info" width="300"/>
   <br/>
6. Security Information<br/>
   The security data is presented in a list with clickable sections for each vulnerability.<br/>
   <img src="images/Extension_Security.png" alt="Extension Security List" width="300"/>
   <br/>
7. Security Details<br/>
   The security details for each vulnerability is available. Click on the reference to display the security details.<br/>
   <img src="images/Extension_Vulnerability_Detail.png" alt="Extension Vulnerability Detail" width="300"/>
   <br/>
8. Remediation<br/>
   The version history is available for each component.<br/>
   <img src="images/Extension_VersionHistoryGraph.png" alt="Extension Version History" width="300"/>
   <br/>
9. Remediation Guidance<br/>
   The remediation guidance API has been added. The recommended fix version will be listed at the top of the screen.
   <br/>
10. License Information<br/>
    <img src="images/Extension_Licensing.png" alt="Extension Licensing" width="300"/>
    <br/>
11. Unsupported Page<br/>
    If you click on an unsupported page then the following screen will appear.
    <img src="images/unsupported_page.png" alt="Unsupported Page" width="300"/>
    <br/>

## Examples

The list of pages that are supported are here:

1. Alpine – Linux – https://pkgs.alpinelinux.org/
2. Chocolatey – Windows – https://chocolatey.org/
3. Clojars – Clojure – https://clojars.org/
4. Cocoa pods – iOS – https://cocoapods.org/
5. Conan – C/C++ – https://conan.io/center/
6. Conda – Python – https://anaconda.org/anaconda/
7. Debian – Linux – https://packages.debian.org/
8. Debian – Linux – https://tracker.debian.org/pkg/

### dotNet - nuget

Pattern - `https://www.nuget.org/packages/<package>/<version>`
<br/>e.g. <https://www.nuget.org/packages/LibGit2Sharp/0.20.1>

### Github - any language supported by OSSIndex but only supports the releases tag at this stage

<https://github.com/jquery/jquery/releases/tag/1.11.1>

### Golang - Gocenter

`https://search.gocenter.io/`
<br/>e.g. <https://search.gocenter.io/github.com~2Fetcd-io~2Fetcd/versions>

### Java - Maven

Pattern - `https://search.maven.org/artifact/<group>/<artifact>/<version>/<extension>`
<br/>e.g. <https://search.maven.org/artifact/org.apache.struts/struts2-core/2.3.30/jar>

Pattern -`https://mvnrepository.com/artifact/<group>/<artifact>/<version>`
<br/>e.g. <https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1>

Pattern - `https://repo1.maven.org/maven2/<group>/<artifact>/<version>/`
<br/> e.g. <https://repo1.maven.org/maven2/commons-collections/commons-collections/3.2.1/>

Pattern - `https://repo.maven.apache.org/maven2/<group>/<artifact>/<version>/`
<br/> e.g. <https://repo.maven.apache.org/maven2/commons-collections/commons-collections/3.2.1/>

### JS/Node - npm

Pattern - `https://www.npmjs.com/package/<package>`
<br/>e.g. <https://www.npmjs.com/package/lodash/>
<br/>and
<br/>Pattern - `https://www.npmjs.com/package/<package>/v/<version>`
<br/>e.g. <https://www.npmjs.com/package/lodash/v/4.17.9>

### PHP - Packagist/Composer

Pattern - `https://packagist.org/`
<br/>e.g. <https://packagist.org/packages/drupal/drupal>

### Ruby - rubygems

Pattern - `https://rubygems.org/gems/<package>`
<br/>e.g. <https://rubygems.org/gems/bundler>

### Python - pypi

Pattern - `https://pypi.org/<package>/`
<br/>e.g. <https://pypi.org/project/Django/>
<br/>or Pattern - `https://pypi.org/<package>/<version>/`
<br/>e.g. <https://pypi.org/project/Django/1.6/>

### R - CRAN

Pattern - `https://cran.r-project.org/`
<br/>e.g. <https://cran.r-project.org/web/packages/A3/index.html>

21. Ruby – RubyGems – https://rubygems.org/

### Rust - Crates

Pattern - `https://crates.io/`
<br/>e.g. <https://crates.io/crates/random>

### NexusRepo - npm, Maven and rubygems

e.g. <http://nexus:8081/#browse/browse:rubygems-proxy:nexus%2F1.4.0%2Fnexus-1.4.0.gem>

## Installation

### Production

1. Install from [Chrome Store](https://chrome.google.com/webstore/detail/mjehedmoboadebjmbmobpedkdgenmlhd/)
2. Click `Add to Chrome`

Note: You will be asked to "Add Sonatype Nexus IQ Extension". Click "Add extension"

3. You will be prompted to enter your login details. (Important: Please note that this version stores your details in plain text in Chrome Storage. We are investigated secure storage but at this time we do not support it. You can use a token for your password though. <https://help.sonatype.com/iqserver/managing/user-management/user-tokens>)
   <br/>
   <img src="images/Extensions_Empty_login.png" alt="drawing" width="300"/>
   <br/>
4. Select an Application to link to this plugin. The application is required to perform the advanced history and remediation scanning now available.
   <br/>
   <img src="images/Extension_Application_List.png" alt="drawing" width="300"/>
   <br/>
5. Click Save to save your credentials.
   <br/>
6. You will be advised that your details are saved. Click Close when you are done and You will be taken back to the Extensions Install screen in Chrome. Close the screen and begin using.
7. The installer will have created a new icon in your Chrome Menu Bar.
   <br/>
   <img src="images/Extensions_Icon_created.png" alt="drawing" width="300"/>
   <br/>

### Developer mode

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
5. Navigate to the folder where you downloaded the plugin from GitHub onto your local machine. Select the src subdirectory and then click select
   <br/>
   <img src="images/Extensions_Choose_Folder.png" alt="drawing" width="300"/>
   <br/>
6. Configure the plugin like in the Production mode...

### Uninstall

If you do not want to use the extension then you can right click on the icon and choose Remove from Chrome
<br/>
<img src="images/Extension_Disabled.png" alt="drawing" width="300"/>
<br/>

### Version History

Go to the [changelog](CHANGELOG.md)

## The Fine Print

Supported by Sonatype Inc.
