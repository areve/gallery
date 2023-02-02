<template>
  <div class="artboard-panel">
    <div class="artboard-wrap">
      <div class="artboard"
        :style="{ 'aspect-ratio': artboardService.artwork.value.bounds.width + ' / ' + artboardService.artwork.value.bounds.height }">
        <canvas ref="canvas" class="canvas" @touchstart="mouseDown" @mousedown="mouseDown" @touchmove="mouseMove"
          @mousemove="mouseMove"></canvas>
        <canvas ref="overlayCanvas" class="overlay-canvas" @touchstart="mouseDown" @mousedown="mouseDown"
          @touchmove="mouseMove" @mousemove="mouseMove"></canvas>
      </div>
    </div>
  </div>

</template>

<script  lang="ts" setup>

import { eraserSize, pencilColor, snapSize, toolSelected } from '@/services/editorAppState';
import { onMounted, ref, watchSyncEffect } from 'vue';
import { clearCircle, drawPencil } from '@/lib/draw';
import { globalDragOrigin } from '@/services/mouseService';
import type { DragOrigin } from '@/interfaces/DragOrigin';
import artboardService, { resetArtwork } from '@/services/artboardService';

const dragOrigin = ref<DragOrigin | null>();
const canvas = ref<HTMLCanvasElement>(undefined!)
const overlayCanvas = ref<HTMLCanvasElement>(undefined!)
let pencilLastPoint: { x: number, y: number } | null = null


onMounted(async () => {
  artboardService.artwork.value.context = canvas.value.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
  artboardService.artwork.value.overlayContext = overlayCanvas.value.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
  resetArtwork()
})

watchSyncEffect(() => {
  if (!artboardService.artwork.value.context) return
  if (!artboardService.artwork.value.overlayContext) return
  artboardService.artwork.value.context.canvas.height = artboardService.artwork.value.bounds.height
  artboardService.artwork.value.context.canvas.width = artboardService.artwork.value.bounds.width
  artboardService.artwork.value.overlayContext.canvas.height = artboardService.artwork.value.bounds.height
  artboardService.artwork.value.overlayContext.canvas.width = artboardService.artwork.value.bounds.width
})

watchSyncEffect(() => {
  if (!artboardService.artwork.value.context) return
  if (!artboardService.artwork.value.overlayContext) return
  void (artboardService.artwork.value.frame)
  artboardService.drawOverlay()
})

watchSyncEffect(() => {
  if (globalDragOrigin.value) return
  dragOrigin.value = null
  pencilLastPoint = null
})

interface PointerEvent {
  readonly x: number;
  readonly y: number;
  readonly index?: number;
  readonly sourceEvent: TouchEvent | MouseEvent
  readonly force?: number
  readonly radiusX?: number
  readonly radiusY?: number
}
function toPointerEvents(event: TouchEvent | MouseEvent) {
  const pointerEvents: PointerEvent[] = []
  if ((event as TouchEvent).touches) {
    const touchEvent = event as TouchEvent
    for (let i = 0; i < touchEvent.touches.length; i++) {
      const touch = touchEvent.touches[i]
      const rect = (touch.target as any).getBoundingClientRect()
      pointerEvents.push(<PointerEvent>{
        x: touch.clientX - window.pageXOffset - rect.left,
        y: touch.clientY - window.pageYOffset - rect.top,
        index: i,
        sourceEvent: event,
        force: touch.force,
        radiusX: touch.radiusX,
        radiusY: touch.radiusY,
      })
    }
  } else {
    const mouseEvent: MouseEvent = event as MouseEvent
    pointerEvents.push(<PointerEvent>{
      x: mouseEvent.offsetX,
      y: mouseEvent.offsetY,
      index: 0,
      sourceEvent: event
    })
  }
  return pointerEvents
}

function mouseDown(event: MouseEvent | TouchEvent) {
  const { x, y } = toPointerEvents(event)[0]

  dragOrigin.value = {
    x,
    y,
    data: artboardService.artwork.value.context.getImageData(0, 0, artboardService.artwork.value.bounds.width, artboardService.artwork.value.bounds.height),
    frame: { ...artboardService.artwork.value.frame }
  }
}

function mouseMove(event: MouseEvent | TouchEvent) {
  if (!dragOrigin.value) return
  const pointerEvents = toPointerEvents(event)
  pointerEvents.forEach(pointerEvent => {
    pointerEvent.sourceEvent.preventDefault()
  })
  // the following line rejects palm presses on my laptop and responds to my pen only, may not work on all devices
  const pointerEvent = pointerEvents.find(x => x.radiusX === 0.5 || x.radiusX === undefined)
  if (!pointerEvent) return
  const { x, y, force, radiusX } = pointerEvent 

  const dx = (x - dragOrigin.value.x) / artboardService.artwork.value.context.canvas.offsetWidth * artboardService.artwork.value.context.canvas.width
  const dy = (y - dragOrigin.value.y) / artboardService.artwork.value.context.canvas.offsetHeight * artboardService.artwork.value.context.canvas.height
  const snapDx = Math.floor(dx / snapSize.value) * snapSize.value
  const snapDy = Math.floor(dy / snapSize.value) * snapSize.value

  if (toolSelected.value === 'eraser') {
    const artworkX = x / artboardService.artwork.value.context.canvas.offsetWidth * artboardService.artwork.value.context.canvas.width
    const artworkY = y / artboardService.artwork.value.context.canvas.offsetHeight * artboardService.artwork.value.context.canvas.height
    clearCircle(artboardService.artwork.value.context, artworkX, artworkY, eraserSize.value / 2)
  } else if (toolSelected.value === 'drag') {
    artboardService.artwork.value.context.clearRect(0, 0, artboardService.artwork.value.bounds.width, artboardService.artwork.value.bounds.height)
    artboardService.artwork.value.context.putImageData(dragOrigin.value.data, snapDx, snapDy)
  } else if (toolSelected.value === 'drag-frame') {
    artboardService.artwork.value.frame.x = dragOrigin.value.frame.x + snapDx
    artboardService.artwork.value.frame.y = dragOrigin.value.frame.y + snapDy
  } else if (toolSelected.value === 'pencil') {
    if (radiusX != 0.5 && radiusX !== undefined) return
    const artworkX = x / artboardService.artwork.value.context.canvas.offsetWidth * artboardService.artwork.value.context.canvas.width
    const artworkY = y / artboardService.artwork.value.context.canvas.offsetHeight * artboardService.artwork.value.context.canvas.height
    const radius = 5 // needs to be a integer, I like 5 - 30 is good for debugging colour mixing
    
    drawPencil(artboardService.artwork.value.context, artworkX, artworkY, radius, pencilColor.value, pencilLastPoint, force ?? 0.5)
    pencilLastPoint = { x: artworkX, y: artworkY }
  }
}
</script>

<style scoped>
.artboard-panel {
  flex: 1 0;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: row;
  background-color: black;

}

.artboard-wrap {
  margin: 0.4em;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.artboard {
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1024 / 1024;

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

.canvas {
  position: relative;
  width: 100%;
  height: 100%;
}

.overlay-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>