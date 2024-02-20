import { createMessageBus } from "@/lib/MessageBus";
import GalleryWorker from "./GalleryWorker?worker";
import { watchPostEffect } from "vue";
import { googleAuthState } from "@/lib/Google/GoogleAuth";
import { progressState, type ProgressState } from "../Progress/progressState";
import { loadBlob } from "../Artboard/artboardService";
import type { Artwork, ArtworkWithBlob } from "./Artwork";

const messageBus = createMessageBus(() => new GalleryWorker());
messageBus.subscribe("updateProgress", onUpdateProgress);

export async function load(artwork: Artwork) {
  const blob = await messageBus.publish<Blob | undefined>({
    name: "loadBlob",
    params: [artwork],
  });
  console.log(blob)
  if (blob) await loadBlob(blob);
}

watchPostEffect(() => {
  messageBus.publish({
    name: "setAccessToken",
    params: [googleAuthState.value.accessToken],
  });
});

export function save(artwork: ArtworkWithBlob) {
  messageBus.publish({
    name: "saveBlob",
    params: [artwork],
  });
}

function onUpdateProgress(update: ProgressState) {
  progressState.value = update;
}
