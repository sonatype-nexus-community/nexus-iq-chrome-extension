export interface ArtifactMessage {
  type: string,
  format: string,
  purl: string,
  url?: string
}

export interface ArtifactMessageResponse {
  type: string,
  artifact: ComponentDetails
}

export interface ComponentDetails {
  componentDetails: ComponentContainer[]
}

export interface ComponentContainer {
  component: Component,
  matchState: any,
  catalogDate: string,
  relativePopularity: string,
  securityData: SecurityData,
  licenseData: LicenseData
}

export interface Component {
  packageUrl: string,
  name: string,
  hash: string,
  componentIdentifier: any
}

export interface SecurityData {
  securityIssues: any[]
}

export interface LicenseData {
  declaredLicenses: LicenseDetail[],
  effectiveLicenses: LicenseDetail[],
  observedLicenses: LicenseDetail[]
}

export interface LicenseDetail {
  licenseId: string,
  licenseName: string
}
