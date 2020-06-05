import { callServer, addCookies } from "./IQServerService";
import { NexusFormat } from "./NexusFormat";
// import { Settings } from "./Settings";
// import { GetSettings } from "./utils";
describe.skip("IQ Server tests", () => {
  test("should callIQ and get an object", async () => {
    let valueCSRF = "91cd69d3-186c-4c51-a772-e0a68ccd36f1";
    let settings = {
      IQCookieToken: valueCSRF,
      username: "admin",
      password: "admin123",
      baseURL: "http://iq-server:8070/",
    };

    let artifact = {
      hash: null,
      format: "maven",
      groupId: "commons-collections",
      artifactId: "commons-collections",
      version: "3.2.1",
      extension: "jar",
      classifier: "",
    };
    let nexusArtifact = NexusFormat(artifact);

    let obj = await callServer(valueCSRF, artifact, settings, nexusArtifact);
    expect(obj).toBe(1);
  });

  test("invalid call to callIQ and get a failed", async () => {
    let valueCSRF = "91cd69d3-186c-4c51-a772-e0a68ccd36f1";
    let settings = {
      IQCookieToken: valueCSRF,
      username: "admin",
      password: "admin123",
      baseURL: "http://iq-server:8070/",
    };

    let artifact = {
      hash: null,
      format: "maven",
      groupId: "commons-collections",
      artifactId: "commons-collections",
      version: "3.2.1",
      extension: "jar",
      classifier: "",
    };
    let nexusArtifact = NexusFormat(artifact);

    let obj = await callServer(valueCSRF, artifact, settings, nexusArtifact);

    let failedResponse = {
      artifact: {
        artifactId: "commons-collections",
        classifier: "",
        extension: "jar",
        format: "maven",
        groupId: "commons-collections",
        hash: null,
        version: "3.2.1",
      },
      message: {
        error: 1,
        response:
          "Server unreachable http://iq-server:8070/api/v2/components/details. Error: Network Error",
      },
      messagetype: "displayMessage",
    };
    expect(obj).toBe(failedResponse);
  });
});
