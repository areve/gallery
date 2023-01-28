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
import { clearCircle } from '@/lib/draw';
import { globalDragOrigin } from '@/services/mouseService';
import type { DragOrigin } from '@/interfaces/DragOrigin';
import artboardService from '@/services/artboardService';

const dragOrigin = ref<DragOrigin | null>();
const canvas = ref<HTMLCanvasElement>(undefined!)
const overlayCanvas = ref<HTMLCanvasElement>(undefined!)
let pencilLastPoint: { x: number, y: number } | null = null


onMounted(async () => {
  artboardService.artwork.value.context = canvas.value.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
  artboardService.artwork.value.overlayContext = overlayCanvas.value.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
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

function normalizeTouch(event: TouchEvent | MouseEvent) {
  event.preventDefault()
  if ((event as MouseEvent).offsetX) {
    return {
      offsetX: (event as MouseEvent).offsetX,
      offsetY: (event as MouseEvent).offsetY
    }
  }
  const rect = (event.target as any).getBoundingClientRect()
  const offsetX = ((event as TouchEvent).touches[0].clientX - window.pageXOffset - rect.left)
  const offsetY = ((event as TouchEvent).touches[0].clientY - window.pageYOffset - rect.top)
  return {
    offsetX,
    offsetY
  }
}
function mouseDown(event: MouseEvent | TouchEvent) {
  const x = normalizeTouch(event).offsetX
  const y = normalizeTouch(event).offsetY

  dragOrigin.value = {
    x,
    y,
    data: artboardService.artwork.value.context.getImageData(0, 0, artboardService.artwork.value.bounds.width, artboardService.artwork.value.bounds.height),
    frame: { ...artboardService.artwork.value.frame }
  }
}

function mouseMove(event: MouseEvent | TouchEvent) {
  if (!dragOrigin.value) return
  const x1 = normalizeTouch(event).offsetX
  const y1 = normalizeTouch(event).offsetY


  const dx = (x1 - dragOrigin.value.x) / artboardService.artwork.value.context.canvas.offsetWidth * artboardService.artwork.value.context.canvas.width
  const dy = (y1 - dragOrigin.value.y) / artboardService.artwork.value.context.canvas.offsetHeight * artboardService.artwork.value.context.canvas.height
  const snapDx = Math.floor(dx / snapSize.value) * snapSize.value
  const snapDy = Math.floor(dy / snapSize.value) * snapSize.value

  if (toolSelected.value === 'eraser') {
    const x = x1 / artboardService.artwork.value.context.canvas.offsetWidth * artboardService.artwork.value.context.canvas.width
    const y = y1 / artboardService.artwork.value.context.canvas.offsetHeight * artboardService.artwork.value.context.canvas.height
    clearCircle(artboardService.artwork.value.context, x, y, eraserSize.value / 2)
  } else if (toolSelected.value === 'drag') {
    artboardService.artwork.value.context.clearRect(0, 0, artboardService.artwork.value.bounds.width, artboardService.artwork.value.bounds.height)
    artboardService.artwork.value.context.putImageData(dragOrigin.value.data, snapDx, snapDy)
  } else if (toolSelected.value === 'drag-frame') {
    artboardService.artwork.value.frame.x = dragOrigin.value.frame.x + snapDx
    artboardService.artwork.value.frame.y = dragOrigin.value.frame.y + snapDy
  } else if (toolSelected.value === 'pencil') {
    const x = x1 / artboardService.artwork.value.context.canvas.offsetWidth * artboardService.artwork.value.context.canvas.width
    const y = y1 / artboardService.artwork.value.context.canvas.offsetHeight * artboardService.artwork.value.context.canvas.height

    const radius = 10
    const context = artboardService.artwork.value.context
    const ctx = context
    context.strokeStyle = pencilColor.value
    context.lineCap = 'round'
    context.lineWidth = radius * 2

    ctx.beginPath();
    ctx.moveTo(pencilLastPoint?.x || x, pencilLastPoint?.y || y);
    ctx.lineTo(x, y);
    ctx.stroke();
    pencilLastPoint = { x, y }
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