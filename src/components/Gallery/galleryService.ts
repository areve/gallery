import { createMessageBus } from "@/lib/MessageBus";
import GalleryWorker from "./GalleryWorker?worker";
import { watchPostEffect } from "vue";
import { notifyError, notifyProgress } from "../Notify/notifyState";
import { loadBlob } from "../Artboard/artboardService";
import type { Artwork, ArtworkWithBlob } from "./Artwork";
import { googleAuthState } from "@/lib/Google/googleAuthState";
import { galleryState } from "./galleryState";

const messageBus = createMessageBus(() => new GalleryWorker());
messageBus.subscribe("notifyError", notifyError);
messageBus.subscribe("notifyProgress", notifyProgress);

export async function loadGallery(path: string) {
  const artworks = await messageBus.request<[]>("loadGallery", [path]);
  galleryState.value.artworks = artworks;
}

export async function loadArtwork(artwork: Artwork) {
  const blob = await messageBus.request<Blob | undefined>("loadBlob", [artwork]);
  notifyProgress("load blob", 1);
  if (blob) await loadBlob(blob);
  notifyProgress("blob loaded");
}

watchPostEffect(() => {
  messageBus.publish("setAccessToken", [googleAuthState.value.accessToken]);
});

export async function saveArtwork(artwork: ArtworkWithBlob) {
  await messageBus.request("saveBlob", [artwork]);
}
