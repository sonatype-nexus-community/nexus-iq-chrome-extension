import { Artifact } from "./Artifact";
import { formats } from "./Formats";
import { dataSources } from "./DataSources";

export class CocoaPodsArtifact extends Artifact {
  constructor(name, version) {
    let _format = formats.cocoapods;
    let _hash = null;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, _hash, _datasource);
    // this.name = name;
    // this.format = formats.maven;
    // this.hash = null;
    // this.datasource = dataSources.NEXUSIQ;
  }
}
