import type { DragOrigin } from "@/interfaces/DragOrigin";
import type { Rect } from "@/interfaces/Rect";
import { clone, rectanglesIntersect } from "@/lib/utils";
import { cloneContext, createContext, autoCropImage } from '@/lib/canvas';
import { ref, type Ref } from "vue";
import type { Artwork, ArtworkActive, ArtworkOnCanvas } from "@/interfaces/Artwork";
import { loadGalleryItem, saveGalleryItem } from "./galleryService";

const dragOrigin = ref<DragOrigin | null>(null)

const artwork = ref<ArtworkActive>({
    status: 'ready',
    filename: '',
    modified: new Date(),
    metadata: { history: [] },
    frame: {
        x: 0,
        y: 0,
        width: 1024,
        height: 1024,
    },

    bounds: {
        x: 0,
        y: 0,
        width: 1024,
        height: 1024,
    },
    context: undefined!,
    overlayContext: undefined!
})

function resetFrame() {
    artwork.value.frame = {
        x: 0,
        y: 0,
        width: artwork.value.bounds.width,
        height: artwork.value.bounds.height,
    }
}

// TODO create a mouseStateService?
function mouseUp(mouse: MouseEvent) {
    dragOrigin.value = null
}

function drawOverlay() {
    artwork.value.overlayContext.clearRect(0, 0, artwork.value.bounds.width, artwork.value.bounds.height)
    artwork.value.overlayContext.fillStyle = '#77777777'
    artwork.value.overlayContext.fillRect(0, 0, artwork.value.bounds.width, artwork.value.bounds.height)
    artwork.value.overlayContext.clearRect(artwork.value.frame.x, artwork.value.frame.y, artwork.value.frame.width, artwork.value.frame.height)
}

function resetArtwork() {
    if (!artwork.value.context) return
    artwork.value.bounds.width = 1024
    artwork.value.bounds.height = 1024
    artwork.value.context.clearRect(0, 0, artwork.value.context.canvas.width, artwork.value.context.canvas.height)
    artwork.value.metadata = { history: [] }
    artwork.value.filename = ''
    artwork.value.modified = new Date()
    resetFrame()
    drawOverlay()
}

async function scale(by: number) {
    if (artwork.value.bounds.width <= 1 && by < 1) return
    if (artwork.value.bounds.width >= 5120 && by > 1) return
    const clone = cloneContext(artwork.value.context)
    artwork.value.context.clearRect(0, 0, artwork.value.context.canvas.width, artwork.value.context.canvas.height)
    artwork.value.bounds.width = Math.min(5120, artwork.value.bounds.width * by)
    artwork.value.bounds.height = Math.min(5120, artwork.value.bounds.height * by)
    const dx = (artwork.value.bounds.width - clone.canvas.width) / 2
    const dy = (artwork.value.bounds.width - clone.canvas.width) / 2
    artwork.value.context.drawImage(
        clone.canvas,
        dx,
        dy,
        clone.canvas.width,
        clone.canvas.height)

    const scaleArtwork_keepFrameSize = false
    if (scaleArtwork_keepFrameSize) {
        artwork.value.frame.x += dx
        artwork.value.frame.y += dy
    } else {
        artwork.value.frame.width += clone.canvas.width
        artwork.value.frame.height += clone.canvas.height
    }

    if (!rectanglesIntersect(artwork.value.frame, { x: 0, y: 0, width: artwork.value.bounds.width, height: artwork.value.bounds.height })) {
        resetFrame()
    }
    drawOverlay()
}

function createContextFromFrame(width: number, height: number) {
    const image = createContext(width, 1024)
    image.drawImage(artwork.value.context.canvas,
        artwork.value.frame.x,
        artwork.value.frame.y,
        artwork.value.frame.width,
        artwork.value.frame.height,
        0, 0, width, height,
    )
    return image
}

function growFrame(by: number) {
    // TODO getting stuck at 512 was frustrating for me once
    if (artwork.value.frame.width <= 512 && by < 1) return
    if (artwork.value.frame.width >= 5120 && by > 1) return
    artwork.value.frame.x -= by / 2
    artwork.value.frame.y -= by / 2
    artwork.value.frame.width = artwork.value.frame.width + by
    artwork.value.frame.height = artwork.value.frame.height + by
    drawOverlay()
}


async function autoCrop() {
    const cropped = await autoCropImage(artwork.value.context)
    artwork.value.bounds.width = cropped.canvas.width
    artwork.value.bounds.height = cropped.canvas.height
    artwork.value.context.drawImage(cropped.canvas, 0, 0)
}

async function load(item: Artwork) {
    const image = await loadGalleryItem(item)
    artwork.value.bounds.width = image.width
    artwork.value.bounds.height = image.height
    resetFrame()
    artwork.value.context.drawImage(image, 0, 0)
    artwork.value.filename = item.filename
    artwork.value.metadata = clone(item.metadata)
}

async function save() {

    const item = await saveGalleryItem(artwork.value)

    artwork.value.filename = item.filename
    artwork.value.metadata = item.metadata
}

export default {
    resetFrame,
    createContextFromFrame,
    growFrame,
    autoCrop,
    artwork,
    mouseUp,
    scale,
    resetArtwork,
    dragOrigin,
    drawOverlay,
    load,
    save
}