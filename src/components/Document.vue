<template>
  <div class="document-panel">
    <div class="document" :style="{ 'aspect-ratio': documentService.bounds.value.width + ' / ' + documentService.bounds.value.height }">
      <canvas id="edit-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
      <canvas id="overlay-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
    </div>
  </div>

</template>

<script  lang="ts" setup>

import { penSize, snapSize, toolSelected } from '@/services/appState';
import documentService from '@/services/documentService';
import { onMounted, ref, watchSyncEffect } from 'vue';
import { clearCircle } from '@/lib/draw';


onMounted(async () => {
  await setupDocument()
})

watchSyncEffect(() => {
  if (!documentService.documentContext.value?.canvas) return
  if (!documentService.overlayContext.value.canvas) return
  documentService.documentContext.value.canvas.height = documentService.bounds.value.height
  documentService.documentContext.value.canvas.width = documentService.bounds.value.width
  documentService.overlayContext.value.canvas.height = documentService.bounds.value.height
  documentService.overlayContext.value.canvas.width = documentService.bounds.value.width
})

watchSyncEffect(() => {
  if (!documentService.documentContext.value?.canvas) return
  if (!documentService.overlayContext.value.canvas) return
  void (documentService.frame.value)
  documentService.drawOverlay()
})


async function setupDocument() {
  // TODO use $ref instead
  const canvas = document.getElementById("edit-canvas") as HTMLCanvasElement
  documentService.documentContext.value = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
  const overlayCanvas = document.getElementById("overlay-canvas") as HTMLCanvasElement
  documentService.overlayContext.value = overlayCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
}




function mouseDown(mouse: MouseEvent) {
    documentService.dragOrigin.value = {
      x: mouse.offsetX,
      y: mouse.offsetY,
      data: documentService.documentContext.value.getImageData(0, 0, documentService.bounds.value.width, documentService.bounds.value.height),
      frame: { ...documentService.frame.value }
    }
}


function mouseMove(mouse: MouseEvent) {
    if (!documentService.dragOrigin.value) return

    const dx = (mouse.offsetX - documentService.dragOrigin.value.x) / documentService.documentContext.value.canvas.offsetWidth * documentService.documentContext.value.canvas.width
    const dy = (mouse.offsetY - documentService.dragOrigin.value.y) / documentService.documentContext.value.canvas.offsetHeight * documentService.documentContext.value.canvas.height
    const snapDx = Math.floor(dx / snapSize.value) * snapSize.value
    const snapDy = Math.floor(dy / snapSize.value) * snapSize.value

    if (toolSelected.value === 'pen') {
      const x = mouse.offsetX / documentService.documentContext.value.canvas.offsetWidth * documentService.documentContext.value.canvas.width
      const y = mouse.offsetY / documentService.documentContext.value.canvas.offsetHeight * documentService.documentContext.value.canvas.height
      clearCircle(documentService.documentContext.value, x, y, penSize.value / 2)
    } else if (toolSelected.value === 'drag') {
      documentService.documentContext.value.clearRect(0, 0, documentService.bounds.value.width, documentService.bounds.value.height)
      documentService.documentContext.value.putImageData(documentService.dragOrigin.value.data, snapDx, snapDy)
    } else if (toolSelected.value === 'drag-frame') {
      documentService.frame.value.x = documentService.dragOrigin.value.frame.x + snapDx
      documentService.frame.value.y = documentService.dragOrigin.value.frame.y + snapDy
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