import { Artifact } from "./Artifact";
import { formats } from "./Formats";
import { dataSources } from "./DataSources";

export class DebianArtifact extends Artifact {
  constructor(name, version) {
    let _format = formats.conan;
    let _hash = null;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, _hash, _datasource);
    // this.name = name;
    // this.version = version;
  }
}
