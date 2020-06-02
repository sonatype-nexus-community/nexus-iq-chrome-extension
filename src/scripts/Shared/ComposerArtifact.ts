import { Artifact } from "./Artifact";
import { formats } from "./Formats";
import { dataSources } from "./DataSources";

export class ComposerArtifact extends Artifact {
  constructor(namespace, name, version) {
    let _format = formats.composer;
    let _hash = null;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, _hash, _datasource);
    // this.name = name;
    // this.namespace = namespace;
    // this.format = formats.maven;
    // this.hash = null;
    // this.datasource = dataSources.NEXUSIQ;
  }
}
