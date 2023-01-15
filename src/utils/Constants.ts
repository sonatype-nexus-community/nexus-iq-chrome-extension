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
  OSSINDEX: 'OSSINDEX'
};

export const REPOSITORY_MANAGERS = {
  NEXUS: 'nexus',
  ARTIFACTORY: 'artifactory'
};

export const DEFAULT_OSSINDEX_URL = 'https://ossindex.sonatype.org/';

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
  rpm: 'rpm'
};

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
  centralSonatypeDev: 'centralSonatypeDev'
};

export interface RepoType {
  url: string;
  repoFormat?: string;
  repoID: string;
  titleSelector?: string;
  versionPath?: string;
  dataSource: string; //TODO: remove this as unnecessary now as we no longer switch datasources on RepoType
  appendVersionPath?: string;
}

export const REPO_TYPES: RepoType[] = [
  {
    repoID: REPOS.alpineLinux,
    url: 'https://pkgs.alpinelinux.org/package/',
    repoFormat: FORMATS.alpine,
    titleSelector: 'th.header ~ td',
    versionPath: '',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: ''
  },
  {
    url: 'https://anaconda.org/',
    repoFormat: FORMATS.conda,
    repoID: REPOS.anacondaCom,
    titleSelector: 'span.long-breadcrumb',
    versionPath: '',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: ''
  },
  {
    url: 'https://chocolatey.org/packages/',
    repoFormat: FORMATS.chocolatey,
    repoID: REPOS.chocolateyOrg,
    titleSelector: 'h1',
    versionPath: '{url}/{packagename}/{versionNumber}',
    dataSource: DATA_SOURCES.OSSINDEX
  },
  {
    url: 'https://clojars.org/',
    repoFormat: FORMATS.clojars,
    repoID: REPOS.clojarsOrg,
    titleSelector: '#jar-title > h1 > a',
    versionPath: '',
    dataSource: DATA_SOURCES.OSSINDEX,
    appendVersionPath: '/versions/{version}'
  },
  {
    url: 'https://cocoapods.org/pods/',
    repoFormat: FORMATS.cocoapods,
    repoID: REPOS.cocoaPodsOrg,
    titleSelector: 'h1',
    versionPath: '',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: ''
  },
  {
    url: 'https://conan.io/center/',
    repoFormat: FORMATS.conan,
    repoID: REPOS.conanIo,
    titleSelector: '.package-name',
    versionPath: '',
    appendVersionPath: '',
    dataSource: DATA_SOURCES.NEXUSIQ
  },
  {
    url: 'https://cran.r-project.org/',
    repoFormat: FORMATS.cran,
    repoID: REPOS.cranRProject,
    titleSelector: 'h2', //"h2.title",?
    versionPath: '',
    appendVersionPath: '',
    dataSource: DATA_SOURCES.NEXUSIQ
  },
  {
    repoID: REPOS.cratesIo,
    url: 'https://crates.io/crates/',
    repoFormat: FORMATS.cargo,
    titleSelector: "div[class*='heading'] h1",
    versionPath: '{url}/{packagename}/{versionNumber}', // https://crates.io/crates/claxon/0.4.0
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: '/{versionNumber}'
  },
  {
    url: 'https://packages.debian.org',
    repoFormat: FORMATS.debian,
    repoID: REPOS.packagesDebianOrg,
    titleSelector: '',
    versionPath: '',
    dataSource: DATA_SOURCES.NEXUSIQ
  },
  {
    url: 'https://tracker.debian.org/pkg',
    repoFormat: FORMATS.debian,
    repoID: REPOS.trackerDebianOrg,
    titleSelector: 'li.list-group-item',
    versionPath: '',
    dataSource: DATA_SOURCES.NEXUSIQ
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
    appendVersionPath: '@{versionNumber}'
  },
  {
    url: 'https://repo1.maven.org/maven2/',
    repoFormat: FORMATS.maven,
    repoID: REPOS.repo1MavenOrg,
    titleSelector: 'h1',
    versionPath: '{url}/{groupid}/{artifactid}/{versionNumber}',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: ''
  },
  {
    url: 'https://repo.maven.apache.org/maven2/',
    repoFormat: FORMATS.maven,
    repoID: REPOS.repoMavenApacheOrg,
    titleSelector: 'h1',
    versionPath: '{url}/{groupid}/{artifactid}/{versionNumber}',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: ''
  },
  {
    url: 'https://search.maven.org/artifact/',
    repoFormat: FORMATS.maven,
    repoID: REPOS.searchMavenOrg,
    titleSelector: '.artifact-title',
    versionPath: '{url}/{groupid}/{artifactid}/{versionNumber}/{extension}',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: ''
  },
  {
    url: 'https://central.sonatype.dev/artifact/',
    repoFormat: FORMATS.maven,
    repoID: REPOS.centralSonatypeDev,
    titleSelector: '.nx-h1',
    versionPath: '{url}/{groupid}/{artifactid}/{versionNumber}',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: ''
  },
  {
    url: 'https://mvnrepository.com/artifact/',
    repoFormat: FORMATS.maven,
    repoID: REPOS.mvnRepositoryCom,
    titleSelector: 'h2.im-title',
    versionPath: '{url}/{groupid}/{artifactid}/{versionNumber}',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: ''
  },
  {
    url: 'https://www.npmjs.com/package/',
    repoFormat: FORMATS.npm,
    repoID: REPOS.npmJs,
    titleSelector: '#top > div > h2 > span', //".package-name-redundant",
    // titleSelector: ".package-name-redundant",
    versionPath: '{url}/{packagename}/v/{versionNumber}',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: '/v/{versionNumber}'
  },
  {
    // https://www.nuget.org/packages/LibGit2Sharp/0.20.1
    url: 'https://www.nuget.org/packages/',
    repoFormat: FORMATS.nuget,
    repoID: REPOS.nugetOrg,
    titleSelector: '.package-title > h1',
    versionPath: '{url}/{packagename}/{versionNumber}',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: '/{versionNumber}'
  },

  {
    url: 'https://packagist.org/packages/',
    repoFormat: FORMATS.composer,
    repoID: REPOS.packagistOrg,
    titleSelector: 'h2.title',
    versionPath: '{url}/{packagename}#{versionNumber}',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: '#{versionNumber}'
  },
  {
    url: 'https://pypi.org/project/',
    repoFormat: FORMATS.pypi,
    repoID: REPOS.pypiOrg,
    titleSelector: 'h1.package-header__name',
    versionPath: '{url}/{packagename}/{versionNumber}',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: '{versionNumber}'
  },
  {
    url: 'https://rubygems.org/gems/',
    repoFormat: FORMATS.gem,
    repoID: REPOS.rubyGemsOrg,
    titleSelector: 'h1.t-display',
    versionPath: '{url}/{packagename}/versions/{versionNumber}',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: '/versions/{versionNumber}'
  },
  {
    url: '/#browse/browse:',
    repoID: REPOS.nexusRepository,
    titleSelector: "div[id*='-coreui-component-componentinfo-'",
    versionPath: '',
    dataSource: DATA_SOURCES.NEXUSIQ,
    appendVersionPath: ''
  }
];
