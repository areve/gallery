import type { GalleryItem, GalleryItemDataUrl, GalleryMetadata } from "@/interfaces/EditorView-interfaces"
import { extendMetadata, getDatestamp } from "@/views/EditorView-utils"
import { createContext } from "@/views/EditorView/canvas"
import { saveGalleryItem, updateGalleryItem } from "./galleryService"

interface Layer {
    image: CanvasRenderingContext2D, // TODO calling it image, is that ok?
    x: number,
    y: number,
    width: number,
    height: number,
}

async function layers(metadata: GalleryMetadata, baseLayer: Layer, ...layers: Layer[]) {
       layers.forEach(layer => {
        baseLayer.image.drawImage(
            layer.image.canvas, 
            layer.x,
            layer.y,
            layer.width,
            layer.height)
    })

    const filename = `composition-${getDatestamp()}.png`
    const item: GalleryItemDataUrl = {
        filename,
        dataUrl: baseLayer.image.canvas.toDataURL(),
        status: 'loading',
        metadata: extendMetadata(metadata, {
            method: 'composition',
            filename,
            created: new Date().toISOString()
        })
    }

    const finalItem = await saveGalleryItem(item)
    updateGalleryItem(finalItem)    
}

export default {
    layers
}