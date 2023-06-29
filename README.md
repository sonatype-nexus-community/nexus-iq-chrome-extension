# Sonatype Platform Browser Extension

[![CircleCI](https://circleci.com/gh/sonatype-nexus-community/vscode-iq-plugin/tree/main.svg?style=shield)](https://circleci.com/gh/sonatype-nexus-community/vscode-iq-plugin/tree/main)
[![GitHub license](https://img.shields.io/github/license/sonatype-nexus-community/vscode-iq-plugin)](https://github.com/sonatype-nexus-community/vscode-iq-plugin/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/sonatype-nexus-community/vscode-iq-plugin)](https://github.com/sonatype-nexus-community/vscode-iq-plugin/issues)
[![GitHub forks](https://img.shields.io/github/forks/sonatype-nexus-community/vscode-iq-plugin)](https://github.com/sonatype-nexus-community/vscode-iq-plugin/network)
[![GitHub stars](https://img.shields.io/github/stars/sonatype-nexus-community/vscode-iq-plugin)](https://github.com/sonatype-nexus-community/vscode-iq-plugin/stargazers)

[![Available on the Chrome Webstore](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png)](https://chrome.google.com/webstore/detail/sonatype-nexus-iq-evaluat/mjehedmoboadebjmbmobpedkdgenmlhd)

The Sonatype Platform Browser Extension (revised name for release 2.0.0 onwards) allows Developers to get insight from Sonatype Lifecycle for Open Source packages as you browse Public Open Source Registries - i.e. before a package is even downloaded!

Version 2.x.x brings a host of changes over the 1.x.x release, and to enable us to get feedback, some features of the 1.x.x version have not yet been ported to the 2.x.x version - we'll get to these in the coming weeks and months. If you rely on features in 1.x.x - please stay on the latest 1.x.x version.

**Contents**

-   [Format \& Ecosystem Support](#format--ecosystem-support)
    -   [Public Registries](#public-registries)
    -   [Private Hosted Registries](#private-hosted-registries)
    -   [Missing or unsupported Registry?](#missing-or-unsupported-registry)
-   [Installation](#installation)
    -   [Installation on Chrome](#installation-on-chrome)
-   [Configuration](#configuration)
-   [Usage](#usage)
    -   [Pinning the Extension](#pinning-the-extension)
    -   [Opening the Extension](#opening-the-extension)
    -   [Component Information](#component-information)
    -   [Remediation Advice](#remediation-advice)
    -   [Policy Violation(s)](#policy-violations)
    -   [Known Security Issues](#known-security-issues)
    -   [Open Source License(s)](#open-source-licenses)
-   [Development](#development)
-   [Uninstallation](#uninstallation)
-   [Version History](#version-history)
-   [The Fine Print](#the-fine-print)

### Notable Features not yet in 2.x.x

-   Support for Sonatype OSS Index as a (free) data source
-   Some public registry formats have not yet been ported - see table below
-   Support for repositories on Sonatype Nexus Repository and jFrog Artifactory has not yet been ported - coming soon

## Format & Ecosystem Support

### Public Registries

**NOTE:** For the initial versions of 2.x.x, support for OSS Index has been removed (so we could ship quicker!) We'll update here when support is re-introduced.

| Registry                | Language            | Enabled in 2.x.x | Enabled in 1.x.x | URL                                 | Sonatype Lifecycle | Sonatype OSS Index |
| ----------------------- | ------------------- | ---------------- | ---------------- | ----------------------------------- | ------------------ | ------------------ |
| Alpine Linux            | Alpine Linux        | ✅               | ✅               | `https://pkgs.alpinelinux.org/`     | ✅                 | ❌                 |
| Anaconda                | Python              | ❌ ^5            | ✅               | `https://anaconda.org/anaconda/`    | ✅                 | ?                  |
| Clojars                 | Java                | ❌               | ❌               | `https://clojars.org/`              | ✅                 | ✅                 |
| CocoaPods               | Swift / Objective-C | ✅               | ✅               | `https://cocoapods.org/`            | ✅                 | ❌                 |
| Conan IO                | C / C++             | ✅               | ✅               | `https://conan.io/center/`          | ✅                 | ❌                 |
| Conda Forge             | Python              | ❌ ^5            | ✅               | `https://anaconda.org/conda-forge/` | ✅                 | ?                  |
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

Upon successfully addition of the Sonatype Platform Browser Extension, you'll automatically be shown the "Getting Started" screen to make the necessary configuration.

![Installation Step 1](./docs/images/install-01.png)

Enter the URL of your Sonatype IQ Server and click "Grant Permissions to your Sonatype IQ Server".

![Installation Step 2](./docs/images/install-02.png)

Click "Allow".

You can now enter your credentials for your Sonatype IQ Server and click "Connect". Upon successful authentication, you'll be provided a list of Applications you have permissions for in your Sonatype IQ Server - choose one!

![Installation Step 3](./docs/images/install-03.png)

That's it - you have configured the Sonatype Platform Browser Extension. You can close the configuration tab. If you need to make changes to the configuration

## Usage

When you browse to a website that is supported by the Sonatype Platform Browser Extension, such as [Maven Central](https://central.sonatype.com/) the extension will assess the component you are viewing and alert you if there are known issues.

### Pinning the Extension

Extension by default are not always visible - we recommend you Pin the Sonatype Platform Browser Extension so it is easily accessible as you navigate. To do this find the "Extensions" icon in the top right of your browser (usually) as highlighed in red:

![Pinning the Extension - Step 1](./docs/images/pin-extension-01.png)

Then click the Pin icon as highlighted next to the Sonatype Platform Browser Extension.

![Pinning the Extension - Step 2](./docs/images/pin-extension-02.png)

You'll now always have the Sonatype Platform Browser Extension icon visible in the top right.

### Opening the Extension

As you browse supported registries, you'll notice the Sonatype Platform Browser Extension change colour to warn you when your Sonatype IQ Server reports issues for the component you are viewing.

![Browsing Maven Central](./docs/images/browse-01.png)

To get the details behind the warning, click the Sonatype Platform Browser Extension icon (top right).

### Component Information

When you acess the Sonatype Platform Browser Extension, you'll be shown the information known by Sonatype about the component you are viewing.

![Component Information](./docs/images/extension-open-01.png)

### Remediation Advice

Accessing the "Remediation" tab will provide easy access to recommended versions along with a timeline of all known versions and how they stack up against your organisations policies in your Sonatype IQ Server.

![Remediation Information](./docs/images/extension-open-02.png)

### Policy Violation(s)

The "Policy" tab allows you to understand why your Organisational policies were violated - i.e. what caused the violations.

![Policy Violation(s) Details](./docs/images/extension-open-03.png)

### Known Security Issues

The "Security" tab allows you to understand what known security issues affect the component you are viewing.

![Known Security Issues](./docs/images/extension-open-04.png)

### Open Source License(s)

The "Legal" tab allows you to understand what open source licenses apply or might apply to the component you are viewing.

![Known Security Issues](./docs/images/extension-open-05.png)

## Development

We use Node 18 and Yarn 1.22.x.

To get started developing:

-   clone the repo
-   `yarn`
-   `yarn build`

You can run `yarn test` as well to ensure everything is setup correctly!

All source code is in `src/` and follows a fairly normal React application setup.

## Uninstallation

To remove the Sonatype Platform Browser Extension, follow the instructions for your browser to remove it.

## Version History

Our version history is kept in our [change log](CHANGELOG.md).

## The Fine Print

Supported by Sonatype Inc.
