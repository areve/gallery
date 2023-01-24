import type { GalleryItem, GalleryMetadata } from "@/interfaces/EditorView-interfaces"
import { extendMetadata, getDatestamp } from "@/views/EditorView-utils"
import { imageCountEmptyPixels } from "@/views/EditorView/canvas"
import { openAiEditImage, openAiGenerateImage } from "@/services/openAiApi"
import { ref } from "vue"
import { saveGalleryItem, updateGalleryItem } from "./galleryService"

const openApiKey = ref<string>('')

interface GenerateOptions {
    prompt: string
}

interface OutpaintOptions {
    prompt: string,
    image: CanvasRenderingContext2D,
    metadata: GalleryMetadata
}

async function generate({ prompt }: GenerateOptions) {
    const filename = `image-0-${getDatestamp()}.png`
    const item: GalleryItem = {
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

    const maskAndImage = (await new Promise<Blob | null>(resolve => image.canvas.toBlob(resolve)))!
    const filename = `image-0-${getDatestamp()}.png`
    const item: GalleryItem = {
        filename,
        status: 'loading',
        metadata: extendMetadata(metadata, {
            method: 'edit',
            prompt,
            image: maskAndImage,
            mask: maskAndImage,
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

export default {
    generate,
    outpaint,
    openApiKey
}