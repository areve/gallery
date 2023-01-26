import { extendMetadata, getDatestamp } from "@/lib/utils"
import { imageCountEmptyPixels } from "@/lib/canvas"
import { openAiEditImage, openAiGenerateImage, openAiImageVariation } from "@/services/openAiApi"
import { ref } from "vue"
import { saveGalleryItem, updateGalleryItem } from "./galleryService"
import type { ArtworkMetadata } from "@/interfaces/ArtworkMetadata"
import type { Artwork } from "@/interfaces/Artwork"

const openApiKey = ref<string>('')

interface GenerateOptions {
    prompt: string
}

interface OutpaintOptions {
    prompt: string,
    image: CanvasRenderingContext2D,
    metadata: ArtworkMetadata
}
interface VariationOptions {
    image: CanvasRenderingContext2D,
    metadata: ArtworkMetadata
}

async function generate({ prompt }: GenerateOptions) {
    const filename = `generation-${getDatestamp()}.png`
    const item: Artwork = {
        filename,
        status: 'waiting',
        metadata: {
            history: [],
            modified: new Date()
        }
    }

    updateGalleryItem(item)
    const generatedImage = await openAiGenerateImage(
        { prompt },
        item, openApiKey.value)
    if (generatedImage.status === 'error') {
        updateGalleryItem(generatedImage)
        return generatedImage
    }

    const updatedItem = await saveGalleryItem(generatedImage)
    updateGalleryItem(updatedItem)
    return updatedItem
}

async function outpaint({ prompt, image, metadata }: OutpaintOptions) {
    if (!prompt.trim()) {
        alert('no prompt!')
        return
    }

    if (await imageCountEmptyPixels(image) === 0) {
        alert('no empty pixels!')
        return
    }

    const imageBlob = (await new Promise<Blob | null>(resolve => image.canvas.toBlob(resolve)))!
    const filename = `outpaint-${getDatestamp()}.png`
    const item: Artwork = {
        filename,
        status: 'waiting',
        metadata
    }

    updateGalleryItem(item)
    const generatedImage = await openAiEditImage(
        { image: imageBlob, mask: imageBlob, prompt },
        item, openApiKey.value)
    if (generatedImage.status === 'error') {
        updateGalleryItem(generatedImage)
        return generatedImage
    }

    const updatedItem = await saveGalleryItem(generatedImage)
    updateGalleryItem(updatedItem)
    return updatedItem
}
async function variation({ image, metadata }: VariationOptions) {
    const imageBlob = (await new Promise<Blob | null>(resolve => image.canvas.toBlob(resolve)))!
    const filename = `variation-${getDatestamp()}.png`
    const item: Artwork = {
        filename,
        status: 'waiting',
        metadata: metadata
    }

    updateGalleryItem(item)
    const generatedImage = await openAiImageVariation(
        { image: imageBlob },
        item, openApiKey.value)
    if (generatedImage.status === 'error') {
        updateGalleryItem(generatedImage)
        return generatedImage
    }

    const updatedItem = await saveGalleryItem(generatedImage)
    updateGalleryItem(updatedItem)
    return updatedItem
}

export default {
    generate,
    outpaint,
    variation,
    openApiKey
}