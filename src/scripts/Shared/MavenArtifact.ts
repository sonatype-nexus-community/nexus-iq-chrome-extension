import { Artifact } from "./Artifact";
import { formats } from "./Formats";
import { dataSources } from "./DataSources";

export class MavenArtifact extends Artifact {
  private _groupId;
  private _artifactId;
  private _version;
  private _extension;
  private _classifier;
  // private _format,
  // private _hash,
  // private _datasource

  constructor(
    groupId,
    artifactId,
    version,
    extension,
    classifier,
    hash?

  ) {
    let _format = formats.maven;
    // let _hash = null;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, hash, _datasource);

    this._groupId = groupId;
    this._artifactId = artifactId;
    this._version = version;
    this._extension = extension;
    this._classifier = classifier;
    // this._format = format;
    // this._hash = hash;
    // this._datasource = datasource;
    // this.format = formats.maven;
    // this.hash = null;
    // this.datasource = dataSources.NEXUSIQ;
  }
}
