import type { GalleryItem } from "@/interfaces/GalleryItem"
import type { GalleryItemDataUrl } from "@/interfaces/GalleryItemDataUrl"
import { clone, findErrorMessage, loadImage } from "@/lib/utils"
import axios from "axios"

async function saveGalleryItem(item: GalleryItemDataUrl) {
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

async function getGallery() {
  let response
  try {
    response = await axios.get('/api/gallery/')
  } catch (e) {
    console.error(e)
    return [] as GalleryItem[]
  }

  return response.data as GalleryItem[]
}

async function getGalleryItem(filename: string) {
  // TODO could be better perhaps if this returned a GalleryItem
  return await loadImage(`/downloads/${filename}`)
}

async function deleteGalleryItem(filename: string) {
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

export default {
  saveGalleryItem,
  getGallery,
  getGalleryItem,
  deleteGalleryItem,
}