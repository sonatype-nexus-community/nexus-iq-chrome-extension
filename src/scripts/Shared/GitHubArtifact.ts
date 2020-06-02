import { Artifact } from "./Artifact";
export class GitHubArtifact extends Artifact {
  private _name;
  private _version;

  constructor(public name, public version, hash, datasource, format) {
    super(format, hash, datasource);
    this._name = this.name;
    this._version = this.version;
  }

  display() {
    return `${this._name} - ${this._version}`;
  }
}
