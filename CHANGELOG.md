## [1.9.8]

### Bug Fixes

-   [#170] Plugin broken when browsing PyPi.org
-   Typo in semantic release

## [1.9.0](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.9.0...v1.8.2) (2020-05-25)

### Features

-   Add Clojurs (#90) (74101f4)

### Bug Fixes

-   [#91] Token not working if xsrf Off in config.yml

## [1.8.2](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.8.2...v1.8.1) (2020-04-30)

### Bug Fixes

-Fix #86

-   Fix Version numbering

## [1.8.1](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.8.1...v1.8.0) (2020-04-26)

### Bug Fixes

-   Fix #83
-   Fix #82
-   Fix #81
-   Fix #78
-   Fix #70
-   Fix #72

## [1.8.0](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.8.0...v1.7.19) (2020-01-28)

### Features

-   add 'Continuous Evaluation' (#63)

### Bug Fixes

-   fix unit tests

-   fix #83

-   fix #64

## [1.7.18](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.7.9...v1.7.18) (2019-12-16)

### Bug Fixes

-   **chrome publish:** automatically push to chrome store ([d5ade2c](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/d5ade2c))

## [1.7.17](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.7.16...v1.7.17) (2019-12-14)

### Features

-   Added Version History Graph #54

### Bug Fixes

-   When using Chrome Extension it logs you out of IQ server #35
-   Browser is not defined #27
-   An error occurred: Invalid cross-site request forgery token #19

-   docs: fix install instructions ([9cf3636](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/9cf36368a7430b708e216708deb59d3a7ae82c1c))

*   added semantic release to circleci ([604703a](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/604703a7cf8c1984e007221cf75a3d057b105594))

-   added semantic-release ([f86fd87](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/f86fd876a2ee1a3f002dbbf36184a5ffcfc6c7bf))

## [1.7.16](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.7.15...v1.7.16) (2019-09-30)

### Bug Fixes

-   added semantic release to circleci ([604703a](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/604703a))

### Features

-   added semantic-release ([f86fd87](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/f86fd87))

## [1.7.15](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.14...1.7.15) (2019-09-19)

### Features

-   Changed license to Apache 2
-   Added support for URLS and fixed parsing for gocenter which keeps changing their markup
    -   https://search.gocenter.io/XXXX/info?version=XXX
    -   https://search.gocenter.io/XXXX/versions
    -   https://repo1.maven.org/maven2/
    -   http://repo2.maven.org/maven2/
-   Prepare for Release to Chrome Store

## [1.7.14](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.13...1.7.14) (2019-07-21)

### Bug Fixes

-   Python page parsing fix

## [1.7.13](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.12...1.7.13) (2019-07-04)

### Bug Fixes

-   Bug Fix Pypi parsing fix

## [1.7.12](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.11...1.7.12) (2019-06-12)

### Bug Fixes

-   Fix bundle type
-   Maven central url parsing when url ends in "Bundle". This is a type and was parsed as an extension. Now parsing correctly and returns results. Previously it did not. e.g. https://search.maven.org/artifact/com.fasterxml.jackson.core/jackson-databind/2.8.11.2/bundle

## [1.7.11](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.10...1.7.11) (2019-06-11)

### Features

-   Add Artifactory Repo
-   Artifactory Remote Repo support (Proxy repo) - you can now browse to an artifactory repo and get a component evaluation. Ensure that you have the component selected first. e.g. http://xx.xx.xx.xx:8081/artifactory/webapp/#/artifacts/browse/tree/General/repo-remote-cache/commons-collections/commons-collections/3.2.1/commons-collections-3.2.1.jar

-   Nexus Proxy Repo Support e.g. http://nexus:8081/#browse/browse:maven-central:commons-collections%2Fcommons-collections%2F3.2.1

### Bug Fixes

-   Golang support fixed - change in URL format at gocenter
-   Various fixes

## [1.7.10](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.9...1.7.10) (2019-05-23)

### Features

-   Added support for Github releases e.g. https://github.com/jquery/jquery/releases/tag/1.11.1
    fixes the following bugs

### Bug Fixes

-   Inability to select an application when installing the plugin for the first time. You can now select an application after you login and this will allow the plugin to work
    Gocenter changed their URL and this stopped go from working, now fixed

## [1.7.9](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.8...1.7.9) (2019-05-06)

### Features

-   Added remediation API support
-   Version History
-   Detailed Sonatype Vulnerability information.
    Improved Styling to match Sonatype Colour palette

## [1.7.8](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.7...1.7.8) (2019-04-03)

### Bug Fixes

-   Fix @angular/animation npm package
-   Fix Cargo pages
-   Fix Packagist pages
-   Improve rendering of errors
-   Improve rendering of OSSIndex pages

## [1.7.7](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.6...1.7.7) (2019-04-03)

### Bug Fixes

-   Bug fix whereby sometimes the Waiting page would sit there for ever. Due to content script not being injected. Seems the content script is always injected now as I inject it with code rather than in the manifest.json declaration

## [1.7.6](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.5...1.7.6) (2019-03-27)

### Bug Fixes

-   Release fixes

## [1.7.5](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/releases/tag/v1.7.5) (2019-03-28)

### Features

-   Initial release
-   Added README.md

## [1.7.4](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/releases/tag/v1.7.5) (2019-03-27)

### Features

-   Styling of User interface

## [1.7.3](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/releases/tag/v1.7.5) (2019-03-27)

### Features

-   Supports running IQ Server on any URL
-   Fixed various bugs

## [1.7.2](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/releases/tag/v1.7.5) (2019-03-27)

### Features

-   added new formats
-   Fixed various bugs
-   Added unit tests

##### Formats/package manager pages supported as of 1.7.2

-   Java - maven - https://search.maven.org/
-   Java - maven - https://mvnrepository.com/
-   JS/Node - npm - https://www.npmjs.com/
-   .Net - nuget - https://www.nuget.org/
-   Ruby - rubygems - https://rubygems.org/
-   Python - pypi - https://pypi.org/
-   php - packagist/composer/ - https://packagist.org/
-   R - CRAN - https://cran.r-project.org/
-   Rust - Crates- https://crates.io/
-   Golang - Go - https://gocenter.jfrog.com/

## [1.7.1](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/releases/tag/v1.7.5) (2019-03-27)

### Bug Fixes

-   Fixed popup logic bug.
-   Began adding testing

## [1.7](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/releases/tag/v1.7.5) (2019-03-27)

### Initial release

-   Complete rewrite to fix cookie problem with calling Nexus IQ Server.
-   I have decided the best way to fix the security issues for now is to limit access to http://iq-server:8070.
-   So you will have to alias your localhost as iq-server in your /etc/hosts/ file to use this plugin for now.
-   I will think about a change which gives access to all URLS like so below

Add `*://*/*` to permissions section like so

`"permissions": [ "*://*/*",`

This would then mean you would not need to alias Nexus IQ.

Supports scanning components in the following repos

-   https://search.maven.org/
-   https://mvnrepository.com/
-   https://www.npmjs.com/
-   https://www.nuget.org/
-   https://rubygems.org/
-   https://pypi.org/
-   https://packagist.org/
