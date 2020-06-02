export class Settings {
  constructor(
    public username: string,
    public password: string,
    public tok: string,
    public hash: string,
    public auth: string,
    public restEndPoint: string,
    public baseURL: string,
    public url: string,
    public loginEndPoint: string,
    public loginurl: string,
    public appId: string,
    public appInternalId: string,
    public hasApprovedServer: boolean,
    public hasApprovedAllUrls: boolean,
    public hasApprovedContinuousEval: boolean,
    public nexusRepoUrl: string,
    public hasApprovedNexusRepoUrl: boolean,
    public artifactoryRepoUrl: string,
    public hasApprovedArtifactoryRepoUrl: boolean,
    public installedPermissions: any,
    public IQCookieToken: string
  ) {
    //implementation of the constructor
  }

  static BuildEmptySettings() {
    let settings = {
      username: "",
      password: "",
      tok: "",
      hash: "",
      auth: "",
      restEndPoint: "",
      baseURL: "",
      url: "",
      loginEndPoint: "",
      loginurl: "",
      appId: "",
      appInternalId: "",
      hasApprovedServer: false,
      hasApprovedAllUrls: false,
      hasApprovedContinuousEval: false,
      nexusRepoUrl: "",
      hasApprovedNexusRepoUrl: false,
      artifactoryRepoUrl: "",
      hasApprovedArtifactoryRepoUrl: false,
      installedPermissions: null,
      IQCookieToken: "",
    };
    return settings;
  }
}
