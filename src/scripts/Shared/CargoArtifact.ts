import { Artifact } from "./Artifact";
import { formats } from "./Formats";
import { dataSources } from "./DataSources";

export class CargoArtifact extends Artifact {
  constructor(name, version) {
    let _format = formats.cargo;
    let _hash = null;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, _hash, _datasource);
    // this.name = name;
    // this.version = version;
  }
}
