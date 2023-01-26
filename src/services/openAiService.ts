import { extendMetadata, getDatestamp } from "@/lib/utils"
import { imageCountEmptyPixels } from "@/lib/canvas"
import { openAiEditImage, openAiGenerateImage, openAiImageVariation } from "@/services/openAiApi"
import { ref } from "vue"
import { saveGalleryItem, updateGalleryItem } from "./galleryService"
import type { GalleryMetadata } from "@/interfaces/GalleryMetadata"
import type { ArtworkBase, ArtworkWaiting } from "@/interfaces/Artwork"

const openApiKey = ref<string>('')

interface GenerateOptions {
    prompt: string
}

interface OutpaintOptions {
    prompt: string,
    image: CanvasRenderingContext2D,
    metadata: GalleryMetadata
}
interface VariationOptions {
    image: CanvasRenderingContext2D,
    metadata: GalleryMetadata
}

async function generate({ prompt }: GenerateOptions) {
    const filename = `generation-${getDatestamp()}.png`
    const item: ArtworkBase = {
        filename,
        status: 'loading',
        metadata: {
            history: [{
                method: 'generation',
                filename,
                prompt,
                version: 'OpenAI'
            }]
        }
    }

    updateGalleryItem(item)
    const generatedImage = await openAiGenerateImage(item, openApiKey.value)
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
    const item: ArtworkWaiting = {
        filename,
        status: 'waiting',
        metadata: extendMetadata(metadata, {
            method: 'edit',
            prompt,
            image: imageBlob,
            mask: imageBlob,
            filename,
            version: 'OpenAI'
        })
    }

    updateGalleryItem(item)
    const generatedImage = await openAiEditImage(item, openApiKey.value)
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
    const item: ArtworkWaiting = {
        filename,
        status: 'waiting',
        metadata: extendMetadata(metadata, {
            method: 'variation',
            image: imageBlob, // TODO does this get saved into files as metadata! no but it's by accident
            filename,
            version: 'OpenAI'
        })
    }

    updateGalleryItem(item)
    const generatedImage = await openAiImageVariation(item, openApiKey.value)
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