import type { GalleryItem } from "@/interfaces/GalleryItem";
import type { GalleryItemDataUrl } from "@/interfaces/GalleryItemDataUrl";
import { clone, findErrorMessage, loadImage } from "@/views/EditorView-utils";
import { ref } from "vue";
import galleryApi from "./galleryApi";

const id = () => Math.random()

interface GalleryItemSelected { id: number, item: GalleryItem }

export const galleryItems = ref<GalleryItem[]>([])
export const onSelected = ref<GalleryItemSelected>(undefined!)
export const selectItem = (item: GalleryItem) => onSelected.value = { id: id(), item }

export async function loadGallery() {
    galleryItems.value = await galleryApi.getGallery()
}

export async function saveGalleryItem(item: GalleryItemDataUrl) {
    updateGalleryItem(item)
    const result = await galleryApi.saveGalleryItem(item)
    updateGalleryItem(result)
    return result
}

export async function deleteGalleryItem(deleteFilename: string) {
    const itemToDelete = clone(galleryItems.value.filter(i => i.filename === deleteFilename)[0])
    itemToDelete.status = 'loading'
    updateGalleryItem(itemToDelete)

    const result = await galleryApi.deleteGalleryItem(deleteFilename)

    if (result.status === 'error') {
        updateGalleryItem(result)
    } else {
        galleryItems.value = galleryItems.value.filter(i => i.filename !== result.filename)
    }
}

export async function loadGalleryItem(item: GalleryItem) {
    return await galleryApi.getGalleryItem(item.filename)
}

export function updateGalleryItem(updatedItem: GalleryItem) {
    if (galleryItems.value.find(item => item.filename === updatedItem.filename)) {
        galleryItems.value = galleryItems.value.map(item => item.filename === updatedItem.filename ? updatedItem : item)
    } else {
        galleryItems.value = [updatedItem, ...galleryItems.value]
    }
}
