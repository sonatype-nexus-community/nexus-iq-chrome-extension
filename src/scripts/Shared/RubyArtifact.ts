import { Artifact } from "./Artifact";

import { formats } from "./Formats";
import { dataSources } from "./DataSources";
export class RubyArtifact extends Artifact {
  // format: "gem",
  // packageId: "bundler",
  // version: "2.0.1",
  // hash: null

  private _packageId;
  private _version;

  constructor(packageId, version, hash) {
    let _format = formats.gem;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, hash, _datasource);
    this._packageId = packageId;
    this._version = version;
  }

  display() {
    return `${this._packageId}-${this._version}`;
  }
}
