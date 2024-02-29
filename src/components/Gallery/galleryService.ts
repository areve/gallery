import { createMessageBus } from "@/lib/MessageBus";
import GalleryWorker from "./GalleryWorker?worker";
import { toRaw, watchPostEffect } from "vue";
import { notifyError, notifyProgress } from "../Notify/notifyState";
import { loadBlob } from "../Artboard/artboardService";
import type { Artwork, ArtworkWithBlob } from "./Artwork";
import { googleAuthState } from "@/lib/Google/googleAuthState";
import { galleryState } from "./galleryState";
import { clone } from "@/lib/utils";

const messageBus = createMessageBus(() => new GalleryWorker());
messageBus.subscribe("notifyError", notifyError);
messageBus.subscribe("notifyProgress", notifyProgress);

export async function loadGallery(path: string) {
  const artworks = await messageBus.request<[]>("loadGallery", [path]);
  galleryState.value.artworks = artworks;
}

export async function deleteArtwork(artwork: Artwork) {
  const success = await messageBus.request<[]>("deleteArtwork", [artwork]);
  console.log("delete result", success);
  const artworks = clone(toRaw(galleryState.value.artworks));
  galleryState.value.artworks = artworks.filter((x) => x.name !== artwork.name);
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
  const savedArtwork = await messageBus.request<Artwork>("saveBlob", [artwork]);
  console.log("savedArtwork", savedArtwork);
  const artworks = clone(toRaw(galleryState.value.artworks));
  artworks.unshift(savedArtwork);
  galleryState.value.artworks = artworks;
  console.log("zzzz", galleryState.value.artworks);
}
