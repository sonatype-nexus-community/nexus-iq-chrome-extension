import { Artifact } from "./Artifact";
import { formats } from "./Formats";
import { dataSources } from "./DataSources";
export class PyPIArtifact extends Artifact {
  //Pypi
  // name: artifact.name,
  // qualifier: artifact.qualifier || "py2.py3-none-any",
  // version: artifact.version,
  // extension: artifact.extension || "whl"
  private _name;
  private _qualifier;
  private _extension;
  private _version;

  constructor(name, qualifier, extension, version, hash?) {
    let _format = formats.pypi;
    let _datasource = dataSources.NEXUSIQ;
    super(_format, hash, _datasource);
    this._name = name;
    this._qualifier = qualifier;
    this._extension = extension;
    this._version = version;
  }

  display() {
    return `${this._name}-${this._version}`;
  }
}
