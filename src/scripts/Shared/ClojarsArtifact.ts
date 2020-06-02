import { Artifact } from "./Artifact";
import { formats } from "./Formats";
import { dataSources } from "./DataSources";

export class ClojarsArtifact extends Artifact {
  constructor(namespace, name, version) {
    let _format = formats.clojars;
    let _hash = null;
    let _datasource = dataSources.OSSINDEX;
    super(_format, _hash, _datasource);
    // this.name = name;
    // this.namespace = namespace;
    // this.version = version;
  }
}
