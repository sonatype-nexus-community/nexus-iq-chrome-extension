import { Artifact } from "./Artifact";
import { formats } from "./Formats";
import { dataSources } from "./DataSources";

export class NPMArtifact extends Artifact {
  private _packageName;
  private _version;

  constructor(packageName, version, hash?) {
    let _format = formats.npm;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, hash, _datasource);
    this._packageName = packageName;
    this._version = version;
  }

  display() {
    return `${this._packageName}-${this._version}`;
  }
}
