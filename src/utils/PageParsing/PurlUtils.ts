import {PackageURL} from 'packageurl-js';

const generatePackageURL = (format: string, name: string, version: string): PackageURL => {
  return generatePackageURLWithNamespace(format, name, version, undefined);
};

const generatePackageURLWithNamespace = (
  format: string,
  name: string,
  version: string,
  namespace: string | undefined
): PackageURL => {
  return new PackageURL(format, namespace, name, version, undefined, undefined);
};

export {generatePackageURL, generatePackageURLWithNamespace};
