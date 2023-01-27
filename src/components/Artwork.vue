<template>
  <div class="artwork-panel">
    <div class="artwork"
      :style="{ 'aspect-ratio': artworkService.artwork.value.bounds.width + ' / ' + artworkService.artwork.value.bounds.height }">
      <canvas ref="canvas" class="edit-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
      <canvas ref="overlayCanvas" class="overlay-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
    </div>
  </div>

</template>

<script  lang="ts" setup>

import { eraserSize, pencilColor, snapSize, toolSelected } from '@/services/appState';
import artworkService from '@/services/artworkService'
import { onMounted, ref, watchSyncEffect } from 'vue';
import { clearCircle } from '@/lib/draw';
import { globalDragOrigin } from '@/services/mouseService';
import type { DragOrigin } from '@/interfaces/DragOrigin';

const dragOrigin = ref<DragOrigin | null>();
const canvas = ref<HTMLCanvasElement>(undefined!)
const overlayCanvas = ref<HTMLCanvasElement>(undefined!)
let pencilLastPoint: { x: number, y: number} | null = null


onMounted(async () => {
  artworkService.artwork.value.context = canvas.value.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
  artworkService.artwork.value.overlayContext = overlayCanvas.value.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
})

watchSyncEffect(() => {
  if (!artworkService.artwork.value.context) return
  if (!artworkService.artwork.value.overlayContext) return
  artworkService.artwork.value.context.canvas.height = artworkService.artwork.value.bounds.height
  artworkService.artwork.value.context.canvas.width = artworkService.artwork.value.bounds.width
  artworkService.artwork.value.overlayContext.canvas.height = artworkService.artwork.value.bounds.height
  artworkService.artwork.value.overlayContext.canvas.width = artworkService.artwork.value.bounds.width
})

watchSyncEffect(() => {
  if (!artworkService.artwork.value.context) return
  if (!artworkService.artwork.value.overlayContext) return
  void (artworkService.artwork.value.frame)
  artworkService.drawOverlay()
})

watchSyncEffect(() => {
  if (globalDragOrigin.value) return
  dragOrigin.value = null
  pencilLastPoint = null
})

function mouseDown(mouse: MouseEvent) {
  dragOrigin.value = {
    x: mouse.offsetX,
    y: mouse.offsetY,
    data: artworkService.artwork.value.context.getImageData(0, 0, artworkService.artwork.value.bounds.width, artworkService.artwork.value.bounds.height),
    frame: { ...artworkService.artwork.value.frame }
  }
}

function mouseMove(mouse: MouseEvent) {
  if (!dragOrigin.value) return

  const dx = (mouse.offsetX - dragOrigin.value.x) / artworkService.artwork.value.context.canvas.offsetWidth * artworkService.artwork.value.context.canvas.width
  const dy = (mouse.offsetY - dragOrigin.value.y) / artworkService.artwork.value.context.canvas.offsetHeight * artworkService.artwork.value.context.canvas.height
  const snapDx = Math.floor(dx / snapSize.value) * snapSize.value
  const snapDy = Math.floor(dy / snapSize.value) * snapSize.value

  if (toolSelected.value === 'eraser') {
    const x = mouse.offsetX / artworkService.artwork.value.context.canvas.offsetWidth * artworkService.artwork.value.context.canvas.width
    const y = mouse.offsetY / artworkService.artwork.value.context.canvas.offsetHeight * artworkService.artwork.value.context.canvas.height
    clearCircle(artworkService.artwork.value.context, x, y, eraserSize.value / 2)
  } else if (toolSelected.value === 'drag') {
    artworkService.artwork.value.context.clearRect(0, 0, artworkService.artwork.value.bounds.width, artworkService.artwork.value.bounds.height)
    artworkService.artwork.value.context.putImageData(dragOrigin.value.data, snapDx, snapDy)
  } else if (toolSelected.value === 'drag-frame') {
    artworkService.artwork.value.frame.x = dragOrigin.value.frame.x + snapDx
    artworkService.artwork.value.frame.y = dragOrigin.value.frame.y + snapDy
  } else if (toolSelected.value === 'pencil') {
    const x = mouse.offsetX / artworkService.artwork.value.context.canvas.offsetWidth * artworkService.artwork.value.context.canvas.width
    const y = mouse.offsetY / artworkService.artwork.value.context.canvas.offsetHeight * artworkService.artwork.value.context.canvas.height

    const radius = 10
    const context = artworkService.artwork.value.context
    const ctx = context
    context.strokeStyle = pencilColor.value
    context.lineCap = 'round'
    context.lineWidth = radius * 2
    
    ctx.beginPath();
    ctx.moveTo(pencilLastPoint?.x || x, pencilLastPoint?.y || y);
    ctx.lineTo(x, y);
    ctx.stroke();
    pencilLastPoint = {x, y}
  }
}
</script>

<style scoped>
.artwork-panel {
  grid-area: controls;
  overflow: hidden;
  margin: 0.4em;
}

.artwork {
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

.edit-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
}

.overlay-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>