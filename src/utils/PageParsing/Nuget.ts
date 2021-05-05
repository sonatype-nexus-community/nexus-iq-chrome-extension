import {PackageURL} from 'packageurl-js';
import {generatePackageURL} from './PurlUtils';

const parseNuget = (url: string): PackageURL | undefined => {
  const elements = url.split('/');
  if (elements.length == 6) {
    const packageId = encodeURIComponent(elements[4]);
    const version = encodeURIComponent(elements[5]);

    return generatePackageURL('nuget', packageId, version);
  }

  return undefined;
};

export {parseNuget};
