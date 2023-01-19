import axios from "axios"
import type { GalleryItem, GalleryItemDataUrl } from "../EditorView-interfaces"
import { loadImage } from "../EditorView-utils"

export async function saveGalleryItem(item: GalleryItemDataUrl) {
  // TODO try catch response
  const response = await axios.post('/api/editor/saveImage', {
    image: item.dataUrl,
    filename: item.filename,
    metadata: item.metadata
  })

  return response.data[0] as GalleryItem
}

export async function getGallery() {
  // TODO try catch response
  const response = await axios.get('/api/gallery/')
  return response.data
}

export async function getGalleryItem(filename: string) {
  return await loadImage(`/downloads/${filename}`)
}


export async function deleteGaleryItem(filename: string) {
  // TODO try catch the response
  const response = await axios.post('/api/editor/deleteImage', {
    filename
  })
  return response.data
}