import type { DragOrigin } from "@/interfaces/DragOrigin";
import type { Rect } from "@/interfaces/Rect";
import { rectanglesIntersect } from "@/views/EditorView-utils";
import { cloneContext, createContext, autoCropImage} from '@/views/EditorView/canvas';
import { ref, type Ref } from "vue";

const dragOrigin = ref<DragOrigin | null>(null)

const frame = ref<Rect>({
    x: 0,
    y: 0,
    width: 1024,
    height: 1024,
})

const bounds = ref<Rect>({
    x: 0,
    y: 0,
    width: 1024,
    height: 1024,
})

// TODO don't use null!
const documentContext = ref<CanvasRenderingContext2D>({} as CanvasRenderingContext2D)
const overlayContext = ref<CanvasRenderingContext2D>({} as CanvasRenderingContext2D)

function resetFrame() {
    frame.value = {
        x: 0,
        y: 0,
        width: bounds.value.width,
        height: bounds.value.height,
    }
}

// TODO create a mouseStateService?
function mouseUp(mouse: MouseEvent) {
    dragOrigin.value = null
}

function drawOverlay() {
    overlayContext.value.clearRect(0, 0, bounds.value.width, bounds.value.height)
    overlayContext.value.fillStyle = '#77777777'
    overlayContext.value.fillRect(0, 0, bounds.value.width, bounds.value.height)
    overlayContext.value.clearRect(frame.value.x, frame.value.y, frame.value.width, frame.value.height)
}

function resetDocument() {
    if (!documentContext.value?.canvas) return
    bounds.value.width = 1024
    bounds.value.height = 1024
    documentContext.value.clearRect(0, 0, documentContext.value.canvas.width, documentContext.value.canvas.height)
    resetFrame()
    drawOverlay()
}

async function scale(by: number) {
    if (bounds.value.width <= 1 && by < 1) return
    if (bounds.value.width >= 5120 && by > 1) return
    const clone = cloneContext(documentContext.value)
    documentContext.value.clearRect(0, 0, documentContext.value.canvas.width, documentContext.value.canvas.height)
    bounds.value.width = Math.min(5120, bounds.value.width * by)
    bounds.value.height = Math.min(5120, bounds.value.height * by)
    const dx = (bounds.value.width - clone.canvas.width) / 2
    const dy = (bounds.value.width - clone.canvas.width) / 2
    documentContext.value.drawImage(
        clone.canvas,
        dx,
        dy,
        clone.canvas.width,
        clone.canvas.height)

    const scaleDocumentCanvas_keepFrameSize = false
    if (scaleDocumentCanvas_keepFrameSize) {
        frame.value.x += dx
        frame.value.y += dy
    } else {
        frame.value.width += clone.canvas.width
        frame.value.height += clone.canvas.height
    }

    if (!rectanglesIntersect(frame.value, { x: 0, y: 0, width: bounds.value.width, height: bounds.value.height })) {
        resetFrame()
    }
    drawOverlay()
}

function createContextFromFrame(width: number, height: number) {
    const image = createContext(width, 1024)
    image.drawImage(documentContext.value.canvas,
        frame.value.x,
        frame.value.y,
        frame.value.width,
        frame.value.height,
        0, 0, width, height,
    )
    return image
}

function growFrame(by: number) {
    // TODO getting stuck at 512 was frustrating for me
    if (frame.value.width <= 512 && by < 1) return
    if (frame.value.width >= 5120 && by > 1) return
    frame.value.x -= by / 2
    frame.value.y -= by / 2
    frame.value.width = frame.value.width + by
    frame.value.height = frame.value.height + by
    drawOverlay()
}


async function autoCrop() {
    const cropped = await autoCropImage(documentContext.value)
    bounds.value.width = cropped.canvas.width
    bounds.value.height = cropped.canvas.height
      documentContext.value.drawImage(cropped.canvas, 0, 0)
  }
  

export default {
    resetFrame,
    createContextFromFrame,
    growFrame,
    autoCrop,
    frame,
    bounds,
    documentContext,
    overlayContext,
    mouseUp,
    scale,
    resetDocument,
    dragOrigin,
    drawOverlay
}