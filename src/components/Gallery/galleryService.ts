import { createMessageBus } from "@/lib/MessageBus";
import GalleryWorker from "./GalleryWorker?worker";
import { watchPostEffect } from "vue";
import { progressMessage, progressState, type ProgressState } from "../Progress/progressState";
import { loadBlob } from "../Artboard/artboardService";
import type { Artwork, ArtworkWithBlob } from "./Artwork";
import { googleAuthState } from "@/lib/Google/googleAuthState";

const messageBus = createMessageBus(() => new GalleryWorker());
messageBus.subscribe("updateProgress", onUpdateProgress);

export async function load(artwork: Artwork) {
  const blob = await messageBus.publish2<Blob | undefined>("loadBlob", [artwork]);
  // TODO the progress goes backwards
  progressMessage("load blob", 2);
  if (blob) await loadBlob(blob);
  progressMessage("blob loaded");
}

watchPostEffect(() => {
  messageBus.publish2("setAccessToken", [googleAuthState.value.accessToken]);
});

export async function save(artwork: ArtworkWithBlob) {
  await messageBus.publish2("saveBlob", [artwork]);
}

function onUpdateProgress(update: ProgressState) {
  progressState.value = update;
}
