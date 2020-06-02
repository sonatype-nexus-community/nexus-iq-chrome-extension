import { Artifact } from "./Artifact";
import { formats } from "./Formats";
import { dataSources } from "./DataSources";

export class ChocolateyArtifact extends Artifact {
  constructor(name, version) {
    let _format = formats.chocolatey;
    let _hash = null;
    let _datasource = dataSources.OSSINDEX;
    super(_format, _hash, _datasource);
    // this.name = name;
    // this.version = version;
  }
}
