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
  const artworks = await messageBus.request<Artwork[]>("loadGallery", [path]);
  const sortedArtworks = artworks.sort((a: Artwork, b: Artwork) => {
    const aTime = a.createdTime || new Date(0);
    const bTime = b.createdTime || new Date(0);
    return aTime === bTime ? 0 : bTime > aTime ? -1 : 1;
  });

  galleryState.value.artworks = sortedArtworks;
}

export async function deleteArtwork(artwork: Artwork) {
  const artworks = clone(toRaw(galleryState.value.artworks));
  const index = artworks.findIndex((x) => x.name === artwork.name);
  artworks.splice(index, 1);
  galleryState.value.artworks = artworks;
  const _success = await messageBus.request<[]>("deleteArtwork", [artwork]);
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
  galleryState.value.artworks.push(artwork);
}

export async function saveArtwork(artwork: ArtworkWithBlob) {
  const savedArtwork = await messageBus.request<Artwork>("saveBlob", [artwork]);
  const artworks = clone(toRaw(galleryState.value.artworks));

  const existingArtwork = artworks.find((x) => x.name === artwork.name);
  console.log("savedArtwork", savedArtwork);
  if (existingArtwork) existingArtwork.thumbnailUrl = savedArtwork.thumbnailUrl;
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
