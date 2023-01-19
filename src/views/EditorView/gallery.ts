import axios from "axios"
import type { GalleryItem, GalleryItemDataUrl } from "../EditorView-interfaces"
import { clone, findErrorMessage, loadImage } from "../EditorView-utils"

export async function saveGalleryItem(item: GalleryItemDataUrl) {
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

export async function getGallery() {
  let response
  try {
    response = await axios.get('/api/gallery/')
  } catch (e) {
    console.error(e)
    return [] as GalleryItem[]
  }

  return response.data as GalleryItem[]
}

export async function getGalleryItem(filename: string) {
  return await loadImage(`/downloads/${filename}`)
}

export async function deleteGaleryItem(filename: string) {
  try {
    await axios.post('/api/editor/deleteImage', {
      filename
    })
  } catch (e) {
    console.error(e)
    return findErrorMessage(e)
  }
  return true
}