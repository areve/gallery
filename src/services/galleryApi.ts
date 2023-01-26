import type { ArtworkDeleted, ArtworkOnCanvas, ArtworkError, ArtworkInMemory, Artwork } from "@/interfaces/Artwork"
import { clone, findErrorMessage, loadImage } from "@/lib/utils"
import axios from "axios"

async function saveGalleryItem(item: ArtworkOnCanvas | ArtworkInMemory) {
  let response
  try {
    response = await axios.post('/api/editor/saveImage', {
      image: (item as ArtworkInMemory).dataUrl || (item as ArtworkOnCanvas).context.canvas.toDataURL(),
      filename: item.filename,
      metadata: item.metadata
    })
  } catch (e) {
    const result: ArtworkError = {
      status: 'error',
      modified: new Date(),
      filename: item.filename,
      metadata: item.metadata,
      error: findErrorMessage(e)
    }
    return result
  }

  return response.data as Artwork
}

async function getGallery() {
  let response
  try {
    response = await axios.get('/api/gallery/')
  } catch (e) {
    console.error(e)
    return [] as Artwork[]
  }

  return response.data as Artwork[]
}

async function getGalleryItem(filename: string) {
  // TODO could be better perhaps if this returned a Artwork
  return await loadImage(`/downloads/${filename}`)
}

async function deleteGalleryItem(filename: string) {
  const result: ArtworkDeleted = {
    status: 'deleted',
    filename,
    modified: new Date(),
    metadata: { history: [] }
  }
  try {
    await axios.post('/api/editor/deleteImage', {
      filename
    })
  } catch (e) {
    const error: ArtworkError = {
      status: 'error',
      modified: new Date(),
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