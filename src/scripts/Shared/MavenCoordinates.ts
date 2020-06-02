import { ComponentCoordinates } from "./ComponentCoordinates";
export class MavenCoordinates extends ComponentCoordinates {
         private _groupId;
         private _artifactId;
         private _version;
         display() {
           console.log("groupId", this._groupId);
           return `<tr>
                            <td class="label">Group:</td>
                            <td class="data"><span id="group">${this._groupId}</span></td>
                        </tr>
                        <tr>
                            <td class="label">Artifact:</td>
                            <td class="data"><span id="artifact">${this._artifactId}</span></td>
                        </tr>
                        <tr>
                            <td class="label">Version:</td>
                            <td class="data"><span id="version">${this._version}</span></td>
                        </tr>`;
         }
         constructor(groupId, artifactId, version) {
           // console.log("groupId", groupId);

           super();
           this._groupId = groupId;
           this._artifactId = artifactId;
           this._version = version;
         }
       }
