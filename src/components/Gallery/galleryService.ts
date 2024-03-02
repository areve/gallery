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
  const artworks = clone(toRaw(galleryState.value.artworks));
  galleryState.value.artworks = artworks.filter((x) => x.name !== artwork.name);
}

export async function loadArtwork(artwork: Artwork) {
  const blob = await messageBus.request<Blob | undefined>("loadBlob", [artwork]);
  notifyProgress("load blob", 1);
  if (blob) await loadBlob(blob);
  notifyProgress("blob loaded");
  notifyProgress("blob loaded");
  notifyProgress("blob loaded");
}

watchPostEffect(() => {
  console.log("calling setAccessToken");
  messageBus.publish("setAccessToken", [googleAuthState.value.accessToken]);
});

export async function saveArtwork(artwork: ArtworkWithBlob) {
  const savedArtwork = await messageBus.request<Artwork>("saveBlob", [artwork]);
  const artworks = clone(toRaw(galleryState.value.artworks));

  const existingArtwork = artworks.find((x) => x.name === artwork.name);
  if (existingArtwork) {
    existingArtwork.thumbnailUrl = savedArtwork.thumbnailUrl;
  } else {
    artworks.unshift(savedArtwork);
  }
  // TODO preserve the scroll position
  galleryState.value.artworks = artworks;
}

// TODO loadDefaultGallery should be called automatically once token is ready
export async function loadDefaultGallery() {
  notifyProgress("load gallery", 1);
  try {
    await loadGallery("/");

    notifyProgress("loaded");
  } catch (error: any) {
    notifyError(error);
  }
}
