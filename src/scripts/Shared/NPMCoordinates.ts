import { ComponentCoordinates } from "./ComponentCoordinates";
export class NPMCoordinates extends ComponentCoordinates {
  private _packageId;
  private _version;
  constructor(packageId, version) {
    super();
    this._packageId = packageId;
    this._version = version;
  }
  display() {
    return `${this._packageId}:${this._version}`;
  }
}
