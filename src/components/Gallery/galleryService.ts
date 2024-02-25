import { createMessageBus } from "@/lib/MessageBus";
import GalleryWorker from "./GalleryWorker?worker";
import { watchPostEffect } from "vue";
import { notifyError, notifyProgress, notifyState, type NotifyState } from "../Notify/notifyState";
import { loadBlob } from "../Artboard/artboardService";
import type { Artwork, ArtworkWithBlob } from "./Artwork";
import { googleAuthState } from "@/lib/Google/googleAuthState";

const messageBus = createMessageBus(() => new GalleryWorker());
messageBus.subscribe("notifyError", notifyError);
messageBus.subscribe("notifyProgress", notifyProgress);

export async function load(artwork: Artwork) {
  const blob = await messageBus.publish2<Blob | undefined>("loadBlob", [artwork]);
  // TODO the progress goes backwards
  notifyProgress("load blob", 1);
  if (blob) await loadBlob(blob);
  notifyProgress("blob loaded");
}

watchPostEffect(() => {
  messageBus.publish2("setAccessToken", [googleAuthState.value.accessToken]);
});

export async function save(artwork: ArtworkWithBlob) {
  await messageBus.publish2("saveBlob", [artwork]);
}
