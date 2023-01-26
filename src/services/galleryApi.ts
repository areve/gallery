import type { Artwork, ArtworkDeleted, ArtworkDisplayed, ArtworkError, ArtworkExportable, ArtworkFile, ArtworkInMemory } from "@/interfaces/Artwork"
import { clone, findErrorMessage, loadImage } from "@/lib/utils"
import axios from "axios"

async function saveGalleryItem(item: ArtworkExportable | ArtworkInMemory) {
  let response
  try {
    response = await axios.post('/api/editor/saveImage', {
      image: (item as ArtworkInMemory).dataUrl || (item as ArtworkExportable).toDataURL(),
      filename: item.filename,
      metadata: item.metadata
    })
  } catch (e) {
    const result: ArtworkError = {
      status: 'error',
      filename: item.filename,
      metadata: item.metadata,
      error: findErrorMessage(e)
    }
    return result
  }

  return response.data as ArtworkFile
}

async function getGallery() {
  let response
  try {
    response = await axios.get('/api/gallery/')
  } catch (e) {
    console.error(e)
    return [] as ArtworkFile[]
  }

  return response.data as ArtworkFile[]
}

async function getGalleryItem(filename: string) {
  // TODO could be better perhaps if this returned a GalleryItem
  return await loadImage(`/downloads/${filename}`)
}

async function deleteGalleryItem(filename: string) {
  const result: ArtworkDeleted = {
    status: 'deleted',
    filename,
    metadata: { history: [], modified: new Date() }
  }
  try {
    await axios.post('/api/editor/deleteImage', {
      filename
    })
  } catch (e) {
    const error: ArtworkError = {
      status: 'error',
      error: findErrorMessage(e),
      filename,
      metadata: result.metadata
    }
    return error
  }
  return result
}

export default {
  saveGalleryItem,
  getGallery,
  getGalleryItem,
  deleteGalleryItem,
}