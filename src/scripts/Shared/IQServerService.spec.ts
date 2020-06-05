import MockAdapter from "axios-mock-adapter";
import sinon, { stubInterface } from "ts-sinon";
import axios from "axios";

import { callServer, addCookies } from "./IQServerService";
import { NexusFormat } from "./NexusFormat";
// import { Settings } from "./Settings";
// import { GetSettings } from "./utils";
import { messageTypes } from "./MessageTypes";

describe("(UnitTest): IQ Server tests", () => {
  var mock;
  beforeEach(() => {
    // sinon.stub(axios, "post").yields();
    mock = new MockAdapter(axios);
  });
  afterEach(() => {
    mock.restore();
  });

  test("should callIQ and get an object", async () => {
    //Arrrange
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
    let expected = {
      messagetype: messageTypes.displayMessage,
      message: { error: 0, response: componentsDetailsLodash },
      artifact: artifact,
    };

    //Action
    mock.onPost().reply(200, componentsDetailsLodash);
    let obj = await callServer(valueCSRF, artifact, settings, nexusArtifact);
    //Assert
    expect(obj).toStrictEqual(expected);
  });

  test("CallIQ to handle network failure", async () => {
    //Arrange
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

    let failedResponse = {
      artifact: artifact,
      message: {
        error: 1,
        response:
          "Server unreachable http://iq-server:8070/api/v2/components/details. Error: Network Error",
      },
      messagetype: "displayMessage",
    };
    //Action
    mock.onPost().networkError();
    let obj = await callServer(valueCSRF, artifact, settings, nexusArtifact);
    console.log("obj", obj);
    //Assert
    expect(obj).toStrictEqual(failedResponse);
  });

  test("CallIQ to handle incorrect permissions", async () => {
    //Arrange
    let valueCSRF = "91cd69d3-186c-4c51-a772-e0a68ccd36f1";
    let settings = {
      IQCookieToken: valueCSRF,
      username: "foo",
      password: "bar",
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

    let failedResponse = {
      artifact: artifact,
      message: {
        error: 401,
        response: "Incorrect username and password",
      },
      messagetype: "displayMessage",
    };
    //Action
    mock.onPost().reply(401, "Incorrect username and password");
    let obj = await callServer(valueCSRF, artifact, settings, nexusArtifact);
    console.log("obj", obj);
    //Assert
    expect(obj).toStrictEqual(failedResponse);
  });
});

const componentsDetailsLodash = {
  componentDetails: [
    {
      component: {
        packageUrl: "pkg:npm/lodash@4.17.9",
        hash: "9c056579af0bdbb4322e",
        componentIdentifier: {
          format: "npm",
          coordinates: {
            packageId: "lodash",
            version: "4.17.9",
          },
        },
      },
      matchState: "exact",
      catalogDate: "2018-04-24T17:44:40.268Z",
      relativePopularity: null,
      licenseData: {
        declaredLicenses: [
          {
            licenseId: "MIT",
            licenseName: "MIT",
          },
        ],
        observedLicenses: [
          {
            licenseId: "Not-Supported",
            licenseName: "Not Supported",
          },
        ],
        effectiveLicenses: [
          {
            licenseId: "MIT",
            licenseName: "MIT",
          },
        ],
      },
      securityData: {
        securityIssues: [
          {
            source: "cve",
            reference: "CVE-2018-16487",
            severity: 9.8,
            url: "http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-16487",
            threatCategory: "critical",
          },
          {
            source: "cve",
            reference: "CVE-2019-10744",
            severity: 9.8,
            url: "http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-10744",
            threatCategory: "critical",
          },
          {
            source: "sonatype",
            reference: "sonatype-2017-0580",
            severity: 6.5,
            url: null,
            threatCategory: "severe",
          },
          {
            source: "sonatype",
            reference: "sonatype-2019-0500",
            severity: 9.8,
            url: null,
            threatCategory: "critical",
          },
          {
            source: "sonatype",
            reference: "sonatype-2020-0292",
            severity: 7.5,
            url: null,
            threatCategory: "critical",
          },
        ],
      },
    },
  ],
};
