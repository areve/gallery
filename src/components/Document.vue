<template>
  <div class="document-panel">
    <div class="document" :style="{ 'aspect-ratio': width + ' / ' + height }">
      <canvas id="edit-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
      <canvas id="overlay-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
    </div>
  </div>

</template>

<script  lang="ts" setup>

import type { DocumentVueReady, DragOrigin, Rect } from '@/interfaces/EditorView-interfaces';
import { penSize, snapSize, toolSelected } from '@/services/appState';
import { onMounted, ref, watchPostEffect, watchSyncEffect, type Ref } from 'vue';
import { clearCircle } from '../views/EditorView/draw';


const documentContext = ref<CanvasRenderingContext2D>({} as CanvasRenderingContext2D)
const overlayContext = ref<CanvasRenderingContext2D>({} as CanvasRenderingContext2D)

const dragOrigin = ref<DragOrigin | null>(null)

const props = withDefaults(defineProps<{
  width: number
  height: number
}>(), {

})

const bounds = ref<Rect>({
  x: 0,
  y: 0,
  width: props.width,
  height: props.height
})

const frame = ref<Rect>({
  x: 0,
  y: 0,
  width: props.width,
  height: props.height
})

watchPostEffect(() => {
  emit('resize', props.width, props.height,)
})

const emit = defineEmits<{
  (e: 'resize', width: number, height: number,): void
  (e: 'ready', ready: DocumentVueReady): void
}>()

onMounted(async () => {
  await setupDocument()
  emit('ready', {
    documentContext: documentContext.value,
    bounds: bounds,
    frame: frame,
    resetFrame: resetFrame,
    mouseUp: mouseUp,
    drawOverlay: drawOverlay
  } as DocumentVueReady)
})

watchSyncEffect(() => {
  if (!documentContext.value.canvas) return
  if (!overlayContext.value.canvas) return
  documentContext.value.canvas.height = props.height
  documentContext.value.canvas.width = props.width
  overlayContext.value.canvas.height = props.height
  overlayContext.value.canvas.width = props.width
})

watchSyncEffect(() => {
  if (!documentContext.value.canvas) return
  if (!overlayContext.value.canvas) return
  void (frame.value)
  drawOverlay()
})

function drawOverlay() {
  overlayContext.value.clearRect(0, 0, props.width, props.height)
  overlayContext.value.fillStyle = '#77777777'
  overlayContext.value.fillRect(0, 0, props.width, props.height)
  overlayContext.value.clearRect(frame.value.x, frame.value.y, frame.value.width, frame.value.height)
}

async function setupDocument() {
  // TODO use $ref instead
  const canvas = document.getElementById("edit-canvas") as HTMLCanvasElement
  documentContext.value = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
  const overlayCanvas = document.getElementById("overlay-canvas") as HTMLCanvasElement
  overlayContext.value = overlayCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
}


function resetFrame() {
  frame.value = {
    x: 0,
    y: 0,
    width: props.width,
    height: props.height,
  }
}

function mouseUp(mouse: MouseEvent) {
  dragOrigin.value = null
}

function mouseDown(mouse: MouseEvent) {
    dragOrigin.value = {
      x: mouse.offsetX,
      y: mouse.offsetY,
      data: documentContext.value.getImageData(0, 0, props.width, props.height),
      frame: { ...frame.value }
    }
}


function mouseMove(mouse: MouseEvent) {
    if (!dragOrigin.value) return

    const dx = (mouse.offsetX - dragOrigin.value.x) / documentContext.value.canvas.offsetWidth * documentContext.value.canvas.width
    const dy = (mouse.offsetY - dragOrigin.value.y) / documentContext.value.canvas.offsetHeight * documentContext.value.canvas.height
    const snapDx = Math.floor(dx / snapSize.value) * snapSize.value
    const snapDy = Math.floor(dy / snapSize.value) * snapSize.value

    if (toolSelected.value === 'pen') {
      const x = mouse.offsetX / documentContext.value.canvas.offsetWidth * documentContext.value.canvas.width
      const y = mouse.offsetY / documentContext.value.canvas.offsetHeight * documentContext.value.canvas.height
      clearCircle(documentContext.value, x, y, penSize.value / 2)
    } else if (toolSelected.value === 'drag') {
      documentContext.value.clearRect(0, 0, props.width, props.height)
      documentContext.value.putImageData(dragOrigin.value.data, snapDx, snapDy)
    } else if (toolSelected.value === 'drag-frame') {
      frame.value.x = dragOrigin.value.frame.x + snapDx
      frame.value.y = dragOrigin.value.frame.y + snapDy
    }
}
</script>

<style scoped>

.document-panel {
  grid-area: controls;
  overflow: hidden;
  margin: 0.4em;
}

.document {
  position: relative;
  top: calc((100% - min(100%, 70vw)) / 2);
  aspect-ratio: 1024 / 1024;
  max-width: calc(min(100%, 70vw));
  max-height: calc(min(100%, 70vw));
  margin: auto;
  background-color: #f7f7f7;
  background-image:
    linear-gradient(45deg, #ddd 25%, transparent 25%),
    linear-gradient(135deg, #ddd 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ddd 75%),
    linear-gradient(135deg, transparent 75%, #ddd 75%);
  background-size: 20px 20px;
  background-position: 0 0, 10px 0, 10px -10px, 0px 10px;
  background-repeat: repeat;
}

#edit-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
}

#overlay-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
}

</style>