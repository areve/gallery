import type { GalleryItemDataUrl } from "@/interfaces/GalleryItemDataUrl"
import type { GalleryMetadata } from "@/interfaces/GalleryMetadata"
import { extendMetadata, getDatestamp } from "@/lib/utils"
import { createContext } from "@/lib/canvas"
import { saveGalleryItem, updateGalleryItem } from "./galleryService"

interface Layer {
    context: CanvasRenderingContext2D, // TODO calling it image, is that ok?
    x: number,
    y: number,
    width: number,
    height: number,
}

interface FlattenOptions {
    metadata: GalleryMetadata,
    width: number,
    height: number,
    layers: Layer[]
}

async function flatten({ metadata, width, height, layers }: FlattenOptions) {
    const context = createContext(width, height)
    layers.forEach(layer => {
        context.drawImage(
            layer.context.canvas,
            layer.x,
            layer.y,
            layer.width,
            layer.height)
    })

    const filename = `composition-${getDatestamp()}.png`
    const item: GalleryItemDataUrl = {
        filename,
        dataUrl: context.canvas.toDataURL(),
        status: 'loading',
        metadata: extendMetadata(metadata, {
            method: 'composition',
            filename,
            created: new Date().toISOString()
        })
    }

    const finalItem = await saveGalleryItem(item)
    updateGalleryItem(finalItem)
    return finalItem
}

export function createLayer(context: CanvasRenderingContext2D) {
    return {
        context: context,
        x: 0,
        y: 0,
        width: context.canvas.width,
        height: context.canvas.height
    } as Layer
}

export default {
    flatten,
    createLayer
}