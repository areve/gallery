import type { Artwork, ArtworkOnCanvas, ArtworkInMemory } from "@/interfaces/Artwork";
import { clone } from "@/lib/utils";
import { ref } from "vue";
import galleryApi from "./galleryApi";

export const selectedItem = ref<Artwork | null>(null);

export const galleryItems = ref<Artwork[]>([]);

export function selectNextArtwork() {
  if (!selectedItem.value) {
    selectedItem.value = galleryItems.value[0];
  } else {
    const i = galleryItems.value.indexOf(selectedItem.value) + 1;
    selectedItem.value = galleryItems.value[i % galleryItems.value.length];
  }
}

export function selectPreviousArtwork() {
  if (!selectedItem.value) {
    selectedItem.value = galleryItems.value[0];
  } else {
    const i = galleryItems.value.indexOf(selectedItem.value) + galleryItems.value.length - 1;
    selectedItem.value = galleryItems.value[i % galleryItems.value.length];
  }
}

export async function loadGallery() {
  galleryItems.value = await galleryApi.getGallery();
}

export async function saveGalleryItem(item: ArtworkOnCanvas | ArtworkInMemory) {
  const itemToSave = clone(item);
  itemToSave.status = "waiting";
  updateGalleryItem(itemToSave);
  const result = await galleryApi.saveGalleryItem(item);
  updateGalleryItem(result);
  return result;
}

export async function deleteGalleryItem(item: Artwork) {
  const itemToDelete = clone(galleryItems.value.filter((i) => i.name === item.name)[0]);
  if (itemToDelete.status === "error") {
    galleryItems.value = galleryItems.value.filter((i) => i.name !== itemToDelete.name);
  } else {
    itemToDelete.status = "waiting";
    updateGalleryItem(itemToDelete);
    const result = await galleryApi.deleteGalleryItem(item.name);
    if (result.status === "error") {
      updateGalleryItem(result);
    } else {
      galleryItems.value = galleryItems.value.filter((i) => i.name !== result.name);
    }
  }
}

export async function loadGalleryItem(item: Artwork) {
  return await galleryApi.getGalleryItem(item.id);
}

export function updateGalleryItem(updatedItem: Artwork) {
  if (galleryItems.value.find((item) => item.name === updatedItem.name)) {
    galleryItems.value = galleryItems.value.map((item) => (item.name === updatedItem.name ? updatedItem : item));
  } else {
    galleryItems.value = [updatedItem, ...galleryItems.value];
  }
}
