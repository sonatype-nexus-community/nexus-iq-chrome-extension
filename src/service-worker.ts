/// <reference path='../node_modules/typescript/lib/lib.webworker.d.ts' />

import { ArtifactMessage } from './types/ArtifactMessage';
import { IqRequestService } from './services/IqRequestService';

const channel = new BroadcastChannel('artifact-messages');

channel.onmessage = async (event: MessageEvent<ArtifactMessage>) => {
  const service = new IqRequestService();

  if (event.data.type === 'getArtifactDetailsFromService') {
    try {
      const res = await service.getComponentDetails(event.data.purl);

      channel.postMessage({type: "artifactResponse", artifact: res});
    }
    catch (ex) {
      console.error(ex);
    }
  } else {
    console.info("Unhandled event type", event.data.type);
  }
};
