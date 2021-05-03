export interface ArtifactMessage {
  type: string;
  format: string;
  purl: string;
  url?: string;
}

export interface ArtifactMessageResponse {
  type: string;
  artifact: ComponentDetails;
}

export interface ComponentDetails {
  componentDetails: ComponentContainer[];
}

export interface ComponentContainer {
  component: Component;
  matchState: any;
  catalogDate: string | null | undefined;
  relativePopularity: string | null | undefined;
  securityData: SecurityData | null | undefined;
  licenseData: LicenseData | null | undefined;
}

export interface Component {
  packageUrl: string;
  name: string | null | undefined;
  hash: string | null | undefined;
  componentIdentifier: any;
}

export interface SecurityData {
  securityIssues: any[];
}

export interface LicenseData {
  declaredLicenses: LicenseDetail[];
  effectiveLicenses: LicenseDetail[];
  observedLicenses: LicenseDetail[];
}

export interface LicenseDetail {
  licenseId: string;
  licenseName: string;
}
