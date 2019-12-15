## [1.7.17](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.7.16...v1.7.17) (2019-12-14)

### Bug Fixes

- docs: fix install instructions ([9cf3636](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/9cf36368a7430b708e216708deb59d3a7ae82c1c))

* added semantic release to circleci ([604703a](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/604703a7cf8c1984e007221cf75a3d057b105594))

### Features

- added semantic-release ([f86fd87](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/f86fd876a2ee1a3f002dbbf36184a5ffcfc6c7bf))

## [1.7.17](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.7.16...v1.7.17) (2019-12-14)

### Bug Fixes

- docs: fix install instructions ([9cf3636](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/9cf3636))

## [1.7.16](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.0.0...v1.7.16) (2019-12-14)

### Bug Fixes

- added semantic release to circleci ([604703a](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/604703a))

### Features

- added semantic-release ([f86fd87](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/f86fd87))

## [1.7.16](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.15...1.7.16) (2019-09-30)

## [1.7.15](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.14...1.7.15) (2019-09-19)

## [1.7.14](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.13...1.7.14) (2019-07-21)

## [1.7.13](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.12...1.7.13) (2019-07-04)

## [1.7.12](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.11...1.7.12) (2019-06-12)

## [1.7.11](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.10...1.7.11) (2019-06-11)

## [1.7.10](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.9...1.7.10) (2019-05-23)

## [1.7.9](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.8...1.7.9) (2019-05-06)

## [1.7.6](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.5...1.7.6) (2019-03-27)

## 1.7.5 (2019-03-26)

#### Version 1.7.7

- Bug fix whereby sometimes the Waiting page would sit there for ever. Due to content script not being injected. Seems the content script is always injected now as I inject it with code rather than in the manifest.json declaration

#### Version 1.7.6

- Release fixes

#### Version 1.7.5

- Added README.md

#### Version 1.7.4-Styling

- Styling of User interface

#### Version 1.7.3-All URLS

- Supports running IQ Server on any URL
- Fixed various bugs

#### Version 1.7.2-added new formats

- added new formats
- Fixed various bugs
- Added unit tests

##### Formats/package manager pages supported as of 1.7.2

- Java - maven - https://search.maven.org/
- Java - maven - https://mvnrepository.com/
- JS/Node - npm - https://www.npmjs.com/
- .Net - nuget - https://www.nuget.org/
- Ruby - rubygems - https://rubygems.org/
- Python - pypi - https://pypi.org/
- php - packagist/composer/ - https://packagist.org/
- R - CRAN - https://cran.r-project.org/
- Rust - Crates- https://crates.io/
- Golang - Go - https://gocenter.jfrog.com/

#### Version 1.7.1 - Fixed popup

- Fixed popup logic bug.
- Began adding testing

#### Version 1.7 - initial release

Complete rewrite to fix cookie problem with calling Nexus IQ Server.
I have decided the best way to fix the security issues for now is to limit access to http://iq-server:8070.
So you will have to alias your localhost as iq-server in your /etc/hosts/ file to use this plugin for now.
I will think about a change which gives access to all URLS like so below

Add `*://*/*` to permissions section like so

`"permissions": [ "*://*/*",`

This would then mean you would not need to alias Nexus IQ.

Supports scanning components in the following repos

- https://search.maven.org/
- https://mvnrepository.com/
- https://www.npmjs.com/
- https://www.nuget.org/
- https://rubygems.org/
- https://pypi.org/
- https://packagist.org/

-----------------From changelog.md---------

## [1.7.17](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.7.16...v1.7.17) (2019-12-14)

### Bug Fixes

- docs: fix install instructions ([9cf3636](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/9cf36368a7430b708e216708deb59d3a7ae82c1c))

* added semantic release to circleci ([604703a](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/604703a7cf8c1984e007221cf75a3d057b105594))

### Features

- added semantic-release ([f86fd87](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/f86fd876a2ee1a3f002dbbf36184a5ffcfc6c7bf))

## [1.7.17](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.7.16...v1.7.17) (2019-12-14)

### Bug Fixes

- docs: fix install instructions ([9cf3636](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/9cf3636))

## [1.7.16](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/v1.0.0...v1.7.16) (2019-12-14)

### Bug Fixes

- added semantic release to circleci ([604703a](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/604703a))

### Features

- added semantic-release ([f86fd87](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/commit/f86fd87))

## [1.7.16](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.15...1.7.16) (2019-09-30)

## [1.7.15](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.14...1.7.15) (2019-09-19)

## [1.7.14](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.13...1.7.14) (2019-07-21)

## [1.7.13](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.12...1.7.13) (2019-07-04)

## [1.7.12](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.11...1.7.12) (2019-06-12)

## [1.7.11](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.10...1.7.11) (2019-06-11)

## [1.7.10](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.9...1.7.10) (2019-05-23)

## [1.7.9](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.8...1.7.9) (2019-05-06)

## [1.7.6](https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension/compare/1.7.5...1.7.6) (2019-03-27)

## 1.7.5 (2019-03-26)

#### Version 1.7.7

- Bug fix whereby sometimes the Waiting page would sit there for ever. Due to content script not being injected. Seems the content script is always injected now as I inject it with code rather than in the manifest.json declaration

#### Version 1.7.6

- Release fixes

#### Version 1.7.5

- Added README.md

#### Version 1.7.4-Styling

- Styling of User interface

#### Version 1.7.3-All URLS

- Supports running IQ Server on any URL
- Fixed various bugs

#### Version 1.7.2-added new formats

- added new formats
- Fixed various bugs
- Added unit tests

##### Formats/package manager pages supported as of 1.7.2

- Java - maven - https://search.maven.org/
- Java - maven - https://mvnrepository.com/
- JS/Node - npm - https://www.npmjs.com/
- .Net - nuget - https://www.nuget.org/
- Ruby - rubygems - https://rubygems.org/
- Python - pypi - https://pypi.org/
- php - packagist/composer/ - https://packagist.org/
- R - CRAN - https://cran.r-project.org/
- Rust - Crates- https://crates.io/
- Golang - Go - https://gocenter.jfrog.com/

#### Version 1.7.1 - Fixed popup

- Fixed popup logic bug.
- Began adding testing

#### Version 1.7 - initial release

Complete rewrite to fix cookie problem with calling Nexus IQ Server.
I have decided the best way to fix the security issues for now is to limit access to http://iq-server:8070.
So you will have to alias your localhost as iq-server in your /etc/hosts/ file to use this plugin for now.
I will think about a change which gives access to all URLS like so below

Add `*://*/*` to permissions section like so

`"permissions": [ "*://*/*",`

This would then mean you would not need to alias Nexus IQ.

Supports scanning components in the following repos

- https://search.maven.org/
- https://mvnrepository.com/
- https://www.npmjs.com/
- https://www.nuget.org/
- https://rubygems.org/
- https://pypi.org/
- https://packagist.org/
