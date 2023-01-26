import type { Artwork, ArtworkOnCanvas, ArtworkInMemory } from "@/interfaces/Artwork";
import { clone } from "@/lib/utils";
import { ref } from "vue";
import galleryApi from "./galleryApi";

const id = () => Math.random()

export const selectedItem = ref<Artwork>()

export const galleryItems = ref<Artwork[]>([])

export async function loadGallery() {
    galleryItems.value = await galleryApi.getGallery()
}

export async function saveGalleryItem(item: ArtworkOnCanvas | ArtworkInMemory) {
    const itemToSave = clone(item) 
    itemToSave.status = 'waiting'
    updateGalleryItem(itemToSave)
    const result = await galleryApi.saveGalleryItem(item)
    updateGalleryItem(result)
    return result
}

export async function deleteGalleryItem(deleteFilename: string) {
    const itemToDelete = clone(galleryItems.value.filter(i => i.filename === deleteFilename)[0])
    itemToDelete.status = 'waiting'
    updateGalleryItem(itemToDelete)
    const result = await galleryApi.deleteGalleryItem(deleteFilename)
    if (result.status === 'error') {
        updateGalleryItem(result)
    } else {
        galleryItems.value = galleryItems.value.filter(i => i.filename !== result.filename)
    }
}

export async function loadGalleryItem(item: Artwork) {
    return await galleryApi.getGalleryItem(item.filename)
}

export function updateGalleryItem(updatedItem: Artwork) {
    if (galleryItems.value.find(item => item.filename === updatedItem.filename)) {
        galleryItems.value = galleryItems.value.map(item => item.filename === updatedItem.filename ? updatedItem : item)
    } else {
        galleryItems.value = [updatedItem, ...galleryItems.value]
    }
}
