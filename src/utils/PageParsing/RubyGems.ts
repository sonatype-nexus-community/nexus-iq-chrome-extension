import {PackageURL} from 'packageurl-js';
import {generatePackageURL} from './PurlUtils';

const parseRuby = (url: string): PackageURL | undefined => {
  const elements = url.split('/');
  if (elements.length > 5) {
    const packageId = encodeURIComponent(elements[4]);
    const version = encodeURIComponent(elements[6]);

    return generatePackageURL('gem', packageId, version);
  }

  return undefined;
};

export {parseRuby};
