import { createMessageBus } from "@/lib/MessageBus";
import GalleryWorker from "./GalleryWorker?worker";
import { toRaw, watch } from "vue";
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
  const _success = await messageBus.request<[]>("deleteArtwork", [artwork]);
  const artworks = clone(toRaw(galleryState.value.artworks));
  galleryState.value.artworks = artworks.filter((x) => x.name !== artwork.name);
}

export async function loadArtwork(artwork: Artwork) {
  const blob = await messageBus.request<Blob | undefined>("loadBlob", [artwork]);
  notifyProgress("load blob", 1);
  if (blob) await loadBlob(blob);
  notifyProgress("blob loaded");
}

watch(() => googleAuthState.value.accessToken, initializeGalleryWorker);
initializeGalleryWorker();

async function initializeGalleryWorker() {
  await messageBus.request("setAccessToken", [googleAuthState.value.accessToken]);
  if (googleAuthState.value.accessToken) await loadDefaultGallery();
}

export async function newArtwork(artwork: Artwork) {
  // const artworks = clone(toRaw(galleryState.value.artworks));
  // // TODO there is no thumbnail
  // galleryState.value.artworks = artworks;
  galleryState.value.artworks.unshift(artwork);
}

export async function saveArtwork(artwork: ArtworkWithBlob) {
  const savedArtwork = await messageBus.request<Artwork>("saveBlob", [artwork]);
  const artworks = clone(toRaw(galleryState.value.artworks));

  const existingArtwork = artworks.find((x) => x.name === artwork.name);
  console.log("savedArtwork", savedArtwork);
  if (existingArtwork) {
    existingArtwork.thumbnailUrl = (savedArtwork as any).thumbnailLink; //TODO wrong type?
    // } else {
    // artworks.unshift(savedArtwork);
  }
  // TODO preserve the scroll position
  galleryState.value.artworks = artworks;
}

export async function loadDefaultGallery() {
  notifyProgress("load gallery", 1);
  try {
    await loadGallery("/");

    notifyProgress("loaded");
  } catch (error: any) {
    notifyError(error);
  }
}
