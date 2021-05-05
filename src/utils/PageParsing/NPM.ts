import {PackageURL} from 'packageurl-js';
import {generatePackageURL, generatePackageURLWithNamespace} from './PurlUtils';

const parseNPM = (url: string): PackageURL | undefined => {
  if (url && url.search('/v/') > 0) {
    console.info('Parsing URL', url);

    const urlElements = url.split('/');
    const name: string = urlElements[4];
    const version: string = urlElements[6];

    return npmNameOrNamespace(name, version);
  } else {
    const found = $('h2 span');

    if (typeof found !== 'undefined') {
      console.log('h2 span found', found);

      const name = found.text().trim();

      const newV = $('h2').next('span');

      if (typeof newV !== 'undefined') {
        const newVText = newV.text();

        const findnbsp = newVText.search(String.fromCharCode(160));

        if (findnbsp >= 0) {
          return npmNameOrNamespace(name, newVText.substring(0, findnbsp));
        }

        return npmNameOrNamespace(name, newVText);
      }
    }
  }

  return undefined;
};

const npmNameOrNamespace = (name: string, version: string): PackageURL => {
  if (name.includes('/')) {
    const namespaceAndName = name.split('/');

    return generatePackageURLWithNamespace(
      'npm',
      namespaceAndName[1],
      version,
      namespaceAndName[0]
    );
  }

  return generatePackageURL('npm', name, version);
};

export {parseNPM};
