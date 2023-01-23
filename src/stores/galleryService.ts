import type { GalleryItem, GalleryItemDataUrl } from "@/views/EditorView-interfaces";
import { clone } from "@/views/EditorView-utils";
import { ref } from "vue";
import { deleteGalleryItemEx, getGalleryEx, getGalleryItemEx, saveGalleryItemEx } from '@/views/EditorView/gallery';


const id = () => Math.random()

interface GalleryItemSelected { id: number, item: GalleryItem}
export const onSelected = ref<GalleryItemSelected>(undefined!)
export const selectItem = (item: GalleryItem) => onSelected.value = { id: id(), item }

export const galleryItems = ref<GalleryItem[]>([])

export async function loadGallery() {
    galleryItems.value = await getGalleryEx()
}


export async function saveGalleryItem(item: GalleryItemDataUrl) {
    updateGalleryItem(item)
    const result = await saveGalleryItemEx(item)
    updateGalleryItem(result)
    return result
}


export async function deleteGalleryItem(deleteFilename: string) {

    const itemToDelete = clone(galleryItems.value.filter(i => i.filename === deleteFilename)[0])
    itemToDelete.status = 'loading'
    updateGalleryItem(itemToDelete)

    const result = await deleteGalleryItemEx(deleteFilename)

    if (result.status === 'error') {
        updateGalleryItem(result)
    } else {
        galleryItems.value = galleryItems.value.filter(i => i.filename !== result.filename)
    }

}
export async function loadGalleryItemZZ(item: GalleryItem) {
    return await getGalleryItemEx(item.filename)

}
export function updateGalleryItem(updatedItem: GalleryItem) {
    if (galleryItems.value.find(item => item.filename === updatedItem.filename)) {
      galleryItems.value = galleryItems.value.map(item => item.filename === updatedItem.filename ? updatedItem : item)
    } else {
      galleryItems.value = [updatedItem, ...galleryItems.value]
    }
  }
  

// export const onAction = ref<AppAction>(undefined!)
// export const action = (action: AppActionType) => onAction.value = { id: id(), action }

