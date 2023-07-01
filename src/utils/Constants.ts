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
export const DATA_SOURCES = {
    NEXUSIQ: 'NEXUSIQ',
    OSSINDEX: 'OSSINDEX',
}

export enum DATA_SOURCE {
    NEXUSIQ = 'Sonatype IQ Server',
    OSSINDEX = 'Sonatype OSS Index',
}

export const REPOSITORY_MANAGERS = {
    NEXUS: 'nexus',
    ARTIFACTORY: 'artifactory',
}

export const DEFAULT_OSSINDEX_URL = 'https://ossindex.sonatype.org/'

export const REMEDIATION_LABELS = {
    'next-no-violations': 'Next version with no policy violation(s)',
    'next-non-failing': 'Next version with no policy action failure(s)',
    'next-no-violations-with-dependencies':
        'Next version with no policy violation(s) for this component and its dependencies',
    'next-non-failing-with-dependencies':
        'Next version with no policy action failure(s) for this component and its dependencies',
}

export const FORMATS = {
    alpine: 'alpine',
    cargo: 'cargo', //cargo == crates == rust
    chocolatey: 'chocolatey',
    clojars: 'clojars',
    cocoapods: 'cocoapods',
    composer: 'composer', //packagist website but composer format, php language
    conan: 'conan',
    conda: 'conda',
    cran: 'cran',
    debian: 'deb',
    gem: 'gem',
    github: 'github',
    golang: 'golang',
    maven: 'maven',
    npm: 'npm',
    nuget: 'nuget',
    pypi: 'pypi',
    rpm: 'rpm',
}

export const REPOS = {
    alpineLinux: 'alpineLinux',
    cratesIo: 'cratesIo',
    npmJs: 'npmJs',
    anacondaCom: 'anacondaCom',
    chocolateyOrg: 'chocolateyOrg',
    clojarsOrg: 'clojarsOrg',
    cocoaPodsOrg: 'cocoaPodsOrg',
    conanIo: 'conanIo',
    cranRProject: 'cranRProject',
    packagesDebianOrg: 'packagesDebianOrg',
    trackerDebianOrg: 'trackerDebianOrg',
    pkgGoDev: 'pkgGoDev',
    nugetOrg: 'nugetOrg',
    packagistOrg: 'packagistOrg',
    pypiOrg: 'pypiOrg',
    rubyGemsOrg: 'rubyGemsOrg',
    nexusRepository: 'nexusRepository',
    mvnRepositoryCom: 'mvnRepositoryCom',
    repoMavenApacheOrg: 'repoMavenApacheOrg',
    searchMavenOrg: 'searchMavenOrg',
    repo1MavenOrg: 'repo1MavenOrg',
    centralSonatypeCom: 'centralSonatypeCom',
}

export interface RepoType {
    url: string
    repoFormat?: string
    repoID: string
    titleSelector?: string
    versionSelector?: string
    versionPath?: string
    dataSource: string //TODO: remove this as unnecessary now as we no longer switch datasources on RepoType
    appendVersionPath?: string
    pathRegex?: RegExp
    versionDomPath?: string
}

export const REPO_TYPES: RepoType[] = [
    {
        repoID: REPOS.alpineLinux,
        url: 'https://pkgs.alpinelinux.org/package/',
        repoFormat: FORMATS.alpine,
        titleSelector: 'th.header ~ td',
        versionPath: '',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '',
        pathRegex:
            /^(?<releaseName>[^/]*)\/(?<releaseFeed>[^/]*)\/(?<architecture>[^/]*)\/(?<artifactId>[^/#?]*)(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
        versionDomPath: '#package > tbody > tr:nth-child(2) > td',
    },
    // {
    //     url: 'https://anaconda.org/',
    //     repoFormat: FORMATS.conda,
    //     repoID: REPOS.anacondaCom,
    //     titleSelector: 'span.long-breadcrumb',
    //     versionPath: '',
    //     dataSource: DATA_SOURCES.NEXUSIQ,
    //     appendVersionPath: '',
    //     pathRegex: /^(?<channel>[^/]*)\/(?<artifactId>[^/#?]*)(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
    //     versionDomPath: 'small.subheader',
    // },
    {
        url: 'https://chocolatey.org/packages/',
        repoFormat: FORMATS.chocolatey,
        repoID: REPOS.chocolateyOrg,
        titleSelector: 'h1',
        versionPath: '{url}/{packagename}/{versionNumber}',
        dataSource: DATA_SOURCES.OSSINDEX,
    },
    {
        url: 'https://clojars.org/',
        repoFormat: FORMATS.clojars,
        repoID: REPOS.clojarsOrg,
        titleSelector: '#jar-title > h1 > a',
        versionPath: '',
        dataSource: DATA_SOURCES.OSSINDEX,
        appendVersionPath: '/versions/{version}',
    },
    {
        url: 'https://cocoapods.org/pods/',
        repoFormat: FORMATS.cocoapods,
        repoID: REPOS.cocoaPodsOrg,
        titleSelector: 'h1',
        versionPath: '',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '',
        pathRegex: /^(?<artifactId>[^/#?]*)(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
        versionDomPath: 'h1 > span',
    },
    {
        url: 'https://conan.io/center/',
        repoFormat: FORMATS.conan,
        repoID: REPOS.conanIo,
        titleSelector: '.package-name',
        versionPath: '',
        appendVersionPath: '',
        dataSource: DATA_SOURCES.NEXUSIQ,
        pathRegex: /^(?<artifactId>[^/#?]*)(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
        versionDomPath: 'h1',
    },
    {
        url: 'https://cran.r-project.org/',
        repoFormat: FORMATS.cran,
        repoID: REPOS.cranRProject,
        titleSelector: 'h2', //"h2.title",?
        versionPath: '',
        appendVersionPath: '',
        dataSource: DATA_SOURCES.NEXUSIQ,
        pathRegex: /^web\/packages\/(?<artifactId>[^/]*)\/index\.html(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
        versionDomPath: 'table tr:nth-child(1) td:nth-child(2)',
    },
    {
        repoID: REPOS.cratesIo,
        url: 'https://crates.io/crates/',
        repoFormat: FORMATS.cargo,
        titleSelector: "div[class*='heading'] h1",
        versionPath: '{url}/{packagename}/{versionNumber}', // https://crates.io/crates/claxon/0.4.0
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '/{versionNumber}',
    },
    {
        url: 'https://packages.debian.org',
        repoFormat: FORMATS.debian,
        repoID: REPOS.packagesDebianOrg,
        titleSelector: '',
        versionPath: '',
        dataSource: DATA_SOURCES.NEXUSIQ,
    },
    {
        url: 'https://tracker.debian.org/pkg',
        repoFormat: FORMATS.debian,
        repoID: REPOS.trackerDebianOrg,
        titleSelector: 'li.list-group-item',
        versionPath: '',
        dataSource: DATA_SOURCES.NEXUSIQ,
    },
    {
        url: 'https://pkg.go.dev/',
        //old gocenter path ->// https://search.gocenter.io/github.com~2Fgo-gitea~2Fgitea/info?version=v1.5.1
        //https://pkg.go.dev/github.com/etcd-io/etcd
        //https://pkg.go.dev/github.com/etcd-io/etcd@v3.3.25+incompatible
        repoFormat: FORMATS.golang,
        repoID: REPOS.pkgGoDev,
        titleSelector:
            'body > main > header > div.go-Main-headerContent > div.go-Main-headerTitle.js-stickyHeader > h1',
        versionPath: '{url}/{packagename}/@{versionNumber}',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '@{versionNumber}',
        pathRegex:
            /^(?<groupId>.+)\/(?<artifactId>[^/]*)\/(?<version>v[^/#?]*)(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
    },
    {
        url: 'https://repo1.maven.org/maven2/',
        repoFormat: FORMATS.maven,
        repoID: REPOS.repo1MavenOrg,
        titleSelector: 'h1',
        versionPath: '{url}/{groupid}/{artifactid}/{versionNumber}',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '',
        pathRegex:
            /^(?<groupArtifactId>([^#?&]*)+)\/(?<version>[^/#&?]+)\/?(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?/,
    },
    {
        url: 'https://repo.maven.apache.org/maven2/',
        repoFormat: FORMATS.maven,
        repoID: REPOS.repoMavenApacheOrg,
        titleSelector: 'h1',
        versionPath: '{url}/{groupid}/{artifactid}/{versionNumber}',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '',
        pathRegex:
            /^(?<groupArtifactId>([^#?&]*)+)\/(?<version>[^/#&?]+)\/?(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?/,
    },
    {
        url: 'https://search.maven.org/artifact/',
        repoFormat: FORMATS.maven,
        repoID: REPOS.searchMavenOrg,
        titleSelector: '.artifact-title',
        versionPath: '{url}/{groupid}/{artifactid}/{versionNumber}/{extension}',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '',
        pathRegex:
            /^(?<groupId>[^/]*)\/(?<artifactId>[^/]*)(\/(?<version>[^/#?]*)\/(?<type>[^?#]*))?(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
    },
    {
        url: 'https://central.sonatype.com/artifact/',
        repoFormat: FORMATS.maven,
        repoID: REPOS.centralSonatypeCom,
        titleSelector: 'h1',
        versionPath: '{url}/{groupid}/{artifactid}/{versionNumber}/{extension}',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '',
        pathRegex:
            /^(?<groupId>[^/]*)\/(?<artifactId>[^/]*)\/(?<version>[^/#?]*)(\/[^#?]*)?(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
    },
    {
        url: 'https://mvnrepository.com/artifact/',
        repoFormat: FORMATS.maven,
        repoID: REPOS.mvnRepositoryCom,
        titleSelector: 'h2.im-title',
        versionPath: '{url}/{groupid}/{artifactid}/{versionNumber}',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '',
        pathRegex:
            /^(?<groupId>[^/]*)\/(?<artifactId>[^/]*)\/(?<version>[^/#?]*)(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
    },
    {
        url: 'https://www.npmjs.com/package/',
        repoFormat: FORMATS.npm,
        repoID: REPOS.npmJs,
        titleSelector: '#top > div > h2 > span', //".package-name-redundant",
        // titleSelector: ".package-name-redundant",
        versionPath: '{url}/{packagename}/v/{versionNumber}',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '/v/{versionNumber}',
        pathRegex:
            /^((?<groupId>@[^/]*)\/)?(?<artifactId>[^/?#]*)(\/v\/(?<version>[^?#]*))?(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
        versionDomPath: 'h2 + span',
    },
    {
        url: 'https://www.nuget.org/packages/',
        repoFormat: FORMATS.nuget,
        repoID: REPOS.nugetOrg,
        titleSelector: '.package-title > h1',
        versionSelector: 'span.version-title',
        versionPath: '{url}/{packagename}/{versionNumber}',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '/{versionNumber}',
        pathRegex: /^(?<artifactId>[^/?#]*)(\/(?<version>[^/?#]*)\/?)?(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
        versionDomPath: 'span.version-title',
    },
    {
        url: 'https://packagist.org/packages/',
        repoFormat: FORMATS.composer,
        repoID: REPOS.packagistOrg,
        titleSelector: 'h2.title',
        versionPath: '{url}/{packagename}#{versionNumber}',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '#{versionNumber}',
        pathRegex: /^(?<groupId>[^/]*)\/(?<artifactId>[^/?#]*)(\?(?<query>([^#]*)))?(#(?<version>(.*)))?$/,
        versionDomPath: '#view-package-page .versions-section .title .version-number',
    },
    {
        url: 'https://pypi.org/project/',
        repoFormat: FORMATS.pypi,
        repoID: REPOS.pypiOrg,
        titleSelector: 'h1.package-header__name',
        versionPath: '{url}/{packagename}/{versionNumber}',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '{versionNumber}',
        pathRegex: /^(?<artifactId>[^/?#]*)\/((?<version>[^?#]*)\/)?(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
        versionDomPath: '#content > div.banner > div > div.package-header__left > h1',
    },
    {
        url: 'https://rubygems.org/gems/',
        repoFormat: FORMATS.gem,
        repoID: REPOS.rubyGemsOrg,
        titleSelector: 'h1.t-display',
        versionSelector: 'body > main > div > h1 > i',
        versionPath: '{url}/{packagename}/versions/{versionNumber}',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '/versions/{versionNumber}',
        pathRegex:
            /^(?<artifactId>[^/?#]*)(\/versions\/(?<version>[^?#]*))?(\?(?<query>([^#]*)))?(#(?<fragment>(.*)))?$/,
        versionDomPath: '.page__subheading',
    },
    {
        url: '/#browse/browse:',
        repoID: REPOS.nexusRepository,
        titleSelector: "div[id*='-coreui-component-componentinfo-'",
        versionPath: '',
        dataSource: DATA_SOURCES.NEXUSIQ,
        appendVersionPath: '',
    },
]
