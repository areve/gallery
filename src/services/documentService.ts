import type { DragOrigin } from "@/interfaces/DragOrigin";
import type { Rect } from "@/interfaces/Rect";
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
  
export default {
    resetFrame,
    frame,
    bounds,
    documentContext,
    overlayContext,
    mouseUp,
    resetDocument,
    dragOrigin,
    drawOverlay
}