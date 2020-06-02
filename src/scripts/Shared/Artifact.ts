export class Artifact {
  private _format: string;
  private _hash: string;
  private _datasource: string;
  constructor(format, hash, datasource) {
    this._format = format;
    this._hash = hash;
    this._datasource = datasource;
  }
  //I have a few properties
  //the hash is not always known
  display() {
    return this.format;
  }
  set hash(value) {
    this._hash = value;
  }
  get hash() {
    return this._hash;
  }
  set datasource(value) {
    this._datasource = value;
  }
  get datasource() {
    return this._datasource;
  }
  set format(value) {
    this._format = value;
  }
  get format() {
    return this._format;
  }
}
