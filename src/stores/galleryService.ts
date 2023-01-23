import type { GalleryItem, GalleryItemDataUrl } from "@/views/EditorView-interfaces";
import { clone, findErrorMessage, loadImage } from "@/views/EditorView-utils";
import { ref } from "vue";
import axios from "axios"

const id = () => Math.random()

interface GalleryItemSelected { id: number, item: GalleryItem }

export const galleryItems = ref<GalleryItem[]>([])
export const onSelected = ref<GalleryItemSelected>(undefined!)
export const selectItem = (item: GalleryItem) => onSelected.value = { id: id(), item }

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

export async function loadGalleryItem(item: GalleryItem) {
    return await getGalleryItemEx(item.filename)
}

export function updateGalleryItem(updatedItem: GalleryItem) {
    if (galleryItems.value.find(item => item.filename === updatedItem.filename)) {
        galleryItems.value = galleryItems.value.map(item => item.filename === updatedItem.filename ? updatedItem : item)
    } else {
        galleryItems.value = [updatedItem, ...galleryItems.value]
    }
}



async function saveGalleryItemEx(item: GalleryItemDataUrl) {
  let response
  try {
    response = await axios.post('/api/editor/saveImage', {
      image: item.dataUrl,
      filename: item.filename,
      metadata: item.metadata
    })
  } catch (e) {
    console.error(e)
    const result = clone(item)
    result.error = findErrorMessage(e)
    result.status = 'error'
    return result
  }

  return response.data as GalleryItem
}

async function getGalleryEx() {
  let response
  try {
    response = await axios.get('/api/gallery/')
  } catch (e) {
    console.error(e)
    return [] as GalleryItem[]
  }

  return response.data as GalleryItem[]
}

async function getGalleryItemEx(filename: string) {
  return await loadImage(`/downloads/${filename}`)
}

async function deleteGalleryItemEx(filename: string) {
  const result: GalleryItem = {
    status: 'deleted',
    filename,
    metadata: { history: [] }
  }
  try {
    await axios.post('/api/editor/deleteImage', {
      filename
    })
  } catch (e) {
    result.status = 'error'
    result.error = findErrorMessage(e)
  }
  return result
}