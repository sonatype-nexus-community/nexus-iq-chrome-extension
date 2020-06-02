import { Artifact } from "./Artifact";
import { formats } from "./Formats";
import { dataSources } from "./DataSources";
export class NugetArtifact extends Artifact {
  private _packageId;
  private _version;

  constructor(packageId, version, hash?) {
    let _format = formats.nuget;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, hash, _datasource);
    this._packageId = packageId;
    this._version = version;
  }

  display() {
    return `${this._packageId}-${this._version}`;
  }
}
