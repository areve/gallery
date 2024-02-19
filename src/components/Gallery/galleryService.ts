import { createMessageBus } from "@/lib/MessageBus";
import GalleryWorker from "./GalleryWorker?worker";
import { watchPostEffect } from "vue";
import { googleAuthState } from "@/lib/Google/GoogleAuth";
import { progressState, type ProgressState } from "../Progress/progressState";
import { loadBlob } from "../Artboard/artboardService";

const messageBus = createMessageBus(() => new GalleryWorker());
messageBus.subscribe("updateProgress", onUpdateProgress);

export function load(metadata: {
  //
  id: null | string;
  name: string;
  path: string;
}) {
  console.log("galleryService:load");

  // TODO if it fails notify the user
  //  const blob = await readFile(rootDirName + "/" + artAppState.value.fileName);
  //  if (blob) await loadBlob(blob);

  messageBus.publish(
    {
      name: "loadBlob",
      params: [metadata],
    },
    undefined,
    (blob: Blob) => {
      console.log("woot", blob);
      loadBlob(blob);
    },
  );
}

watchPostEffect(() => {
  messageBus.publish({
    name: "setAccessToken",
    params: [googleAuthState.value.accessToken],
  });
});
export function save(
  blob: Blob,
  metadata: {
    id: null | string;
    name: string;
    path: string;
  },
) {
  messageBus.publish({
    name: "saveBlob",
    params: [blob, metadata],
  });
}

function onUpdateProgress(update: ProgressState) {
  console.log("onUpdateProgress", update);
  progressState.value = update;
}
