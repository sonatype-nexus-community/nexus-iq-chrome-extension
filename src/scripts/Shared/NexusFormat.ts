import { formats } from "./Formats";
const NexusFormat = (artifact) => {
  console.log("NexusFormat", artifact);
  let format = artifact.format;
  let requestdata;
  switch (format) {
    case formats.alpine:
      requestdata = NexusFormatAlpine(artifact);
      break;
    case formats.cocoapods:
      requestdata = NexusFormatCocoaPods(artifact);
      break;
    case formats.conan:
      requestdata = NexusFormatConan(artifact);
      break;
    case formats.cargo:
      requestdata = NexusFormatCargo(artifact);
      break;
    case formats.composer:
      requestdata = NexusFormatComposer(artifact);
      break;
    case formats.conda:
      requestdata = NexusFormatConda(artifact);
      break;
    case formats.cran:
      requestdata = NexusFormatCran(artifact);
      break;
    case formats.debian:
      requestdata = NexusFormatDebian(artifact);
      break;

    case formats.gem:
      requestdata = NexusFormatRuby(artifact);
      break;
    case formats.golang:
      requestdata = NexusFormatGolang(artifact);
      break;
    case formats.maven:
      requestdata = NexusFormatMaven(artifact);
      break;
    case formats.npm:
      requestdata = NexusFormatNPM(artifact);
      break;
    case formats.nuget:
      requestdata = NexusFormatNuget(artifact);
      break;
    case formats.pypi:
      requestdata = NexusFormatPyPI(artifact);
      break;
    case formats.rpm:
      requestdata = NexusFormatRPM(artifact);
      break;
    default:
      console.log("Unexpected format", format);
      return;
  }
  return requestdata;
};

const NexusFormatAlpine = (artifact) => {
  let component;
  let componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: artifact.name,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatMaven = (artifact) => {
  //return a dictionary in Nexus Format
  //return dictionary of components
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            groupId: artifact.groupId,
            artifactId: artifact.artifactId,
            version: artifact.version,
            extension: artifact.extension,
            classifier: "",
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatNPM = (artifact) => {
  //return a dictionary in Nexus Format
  //return dictionary of components
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            packageId: artifact.packageName,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatNuget = (artifact) => {
  //return a dictionary in Nexus Format ofr Nuget
  //return dictionary of components
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            packageId: artifact.packageId,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatPyPI = (artifact) => {
  //Python -> pypi
  //return a dictionary in Nexus Format
  //return dictionary of components
  //TODO: how to determine the qualifier and the extension??
  let component;
  //artifact.qualifier || "py2.py3-none-any"
  //artifact.extension = "whl";
  // artifact.extension = "zip";
  // artifact.qualifier = "";

  let componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: artifact.name,
            qualifier: artifact.qualifier,
            version: artifact.version,
            extension: artifact.extension,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatRuby = (artifact) => {
  //return a dictionary in Nexus Format
  //return dictionary of components
  //TODO: how to determine the qualifier and the extension??
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: artifact.name,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatGolang = (artifact) => {
  //return a dictionary in Nexus Format
  //return dictionary of components
  // "name": "github.com/gorilla/mux",
  //"version": "v1.7.0"
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: `${artifact.type}/${artifact.namespace}/${artifact.name}`,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatRPM = (artifact) => {
  //return a dictionary in Nexus Format
  //return dictionary of components
  // "name": "github.com/gorilla/mux",
  //"version": "v1.7.0"
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: `${artifact.name}`,
            version: artifact.version,
            architecture: artifact.architecture,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatCocoaPods = (artifact) => {
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: `${artifact.name}`,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatConan = (artifact) => {
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: `${artifact.name}`,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatCargo = (artifact) => {
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: `${artifact.name}`,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatComposer = (artifact) => {
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: `${artifact.name}`,
            namespace: `${artifact.namespace}`,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatConda = (artifact) => {
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: `${artifact.name}`,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatCran = (artifact) => {
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: `${artifact.name}`,

            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

const NexusFormatDebian = (artifact) => {
  let componentDict, component;
  componentDict = {
    components: [
      (component = {
        hash: artifact.hash,
        componentIdentifier: {
          format: artifact.format,
          coordinates: {
            name: `${artifact.name}`,
            version: artifact.version,
          },
        },
      }),
    ],
  };
  return componentDict;
};

export {
  //Nexus Formatters
  NexusFormat,
  NexusFormatAlpine,
  NexusFormatCargo,
  NexusFormatCocoaPods,
  NexusFormatComposer,
  NexusFormatConan,
  NexusFormatConda,
  NexusFormatCran,
  NexusFormatDebian,
  NexusFormatMaven,
  NexusFormatNPM,
  NexusFormatNuget,
  NexusFormatPyPI,
  NexusFormatRuby,
};
