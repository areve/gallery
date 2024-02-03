import type { Artwork, ArtworkOnCanvas, ArtworkInMemory } from "@/interfaces/Artwork";
import { clone } from "@/lib/utils";
import { ref } from "vue";
import galleryAdapter from "./googleGalleryAdapter";

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
  galleryItems.value = await galleryAdapter.getGallery();
  galleryItems.value.map(async (item) => updateGalleryItem(await galleryAdapter.loadGalleryItem(item)));
}

export async function saveGalleryItem(item: Artwork) {
  const itemToSave = clone(item);
  itemToSave.status = "waiting";
  updateGalleryItem(itemToSave);
  const result = await galleryAdapter.saveGalleryItem(item);
  updateGalleryItem(result);
  return result;
}

export async function deleteGalleryItem(item: Artwork) {
  const itemToDelete = clone(galleryItems.value.filter((i) => i.id === item.id)[0]);
  if (itemToDelete.status === "error") {
    removeGalleryItem(itemToDelete);
  } else {
    itemToDelete.status = "waiting";
    updateGalleryItem(itemToDelete);
    const result = await galleryAdapter.deleteGalleryItem(item);
    if (result.status === "error") {
      updateGalleryItem(result);
    } else {
      removeGalleryItem(result);
    }
  }
}

// TODO loadGalleryItem and loadGalleryItemById should be combined, possibly merged with other code too
export async function loadGalleryItem(item: Artwork) {
  return await galleryAdapter.getGalleryItem(item.id);
}

export async function loadGalleryItemById(id: string) {
  return await galleryAdapter.getGalleryItem(id);
}

export function removeGalleryItem(removeItem: Artwork) {
  galleryItems.value = galleryItems.value.filter((i) => i.id !== removeItem.id);
}

export function updateGalleryItem(updatedItem: Artwork) {
  if (galleryItems.value.find((item) => item.id === updatedItem.id)) {
    galleryItems.value = galleryItems.value.map((item) => (item.id === updatedItem.id ? updatedItem : item));
  } else if (galleryItems.value.find((item) => item.name === updatedItem.name)) {
    galleryItems.value = galleryItems.value.map((item) => (item.id === "" ? updatedItem : item));
  } else {
    galleryItems.value = [updatedItem, ...galleryItems.value];
  }
}
