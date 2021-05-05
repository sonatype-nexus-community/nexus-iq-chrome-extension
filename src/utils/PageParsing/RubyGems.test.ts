import {DATA_SOURCES, FORMATS, RepoType} from '../Constants';
import {getArtifactDetailsFromDOM} from '../PageParsing';

describe('Ruby Gems Page Parsing', () => {
  test('should parse a valid rubygems page', () => {
    const rt: RepoType = {
      url: '',
      repoFormat: FORMATS.gem,
      titleSelector: '',
      versionPath: '',
      dataSource: DATA_SOURCES.NEXUSIQ,
      appendVersionPath: ''
    };

    const PackageURL = getArtifactDetailsFromDOM(
      rt,
      'https://rubygems.org/gems/chelsea/versions/0.0.32'
    );

    expect(PackageURL).toBeDefined();
    expect(PackageURL?.type).toBe('gem');
    expect(PackageURL?.name).toBe('chelsea');
    expect(PackageURL?.version).toBe('0.0.32');
  });
});
