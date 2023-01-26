<template>
  <div class="artwork-panel">
    <div class="artwork"
      :style="{ 'aspect-ratio': artworkService.artwork.value.bounds.width + ' / ' + artworkService.artwork.value.bounds.height }">
      <canvas id="edit-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
      <canvas id="overlay-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
    </div>
  </div>

</template>

<script  lang="ts" setup>

import { penSize, snapSize, toolSelected } from '@/services/appState';
import artworkService from '@/services/artworkService'
import { onMounted, ref, watchSyncEffect } from 'vue';
import { clearCircle } from '@/lib/draw';

onMounted(async () => {
  // TODO use $ref instead
  const canvas = document.getElementById("edit-canvas") as HTMLCanvasElement
  artworkService.artwork.value.mainContext = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
  const overlayCanvas = document.getElementById("overlay-canvas") as HTMLCanvasElement
  artworkService.artwork.value.overlayContext = overlayCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
})

watchSyncEffect(() => {
  if (!artworkService.artwork.value.mainContext?.canvas) return
  if (!artworkService.artwork.value.overlayContext.canvas) return
  artworkService.artwork.value.mainContext.canvas.height = artworkService.artwork.value.bounds.height
  artworkService.artwork.value.mainContext.canvas.width = artworkService.artwork.value.bounds.width
  artworkService.artwork.value.overlayContext.canvas.height = artworkService.artwork.value.bounds.height
  artworkService.artwork.value.overlayContext.canvas.width = artworkService.artwork.value.bounds.width
})

watchSyncEffect(() => {
  if (!artworkService.artwork.value.mainContext?.canvas) return
  if (!artworkService.artwork.value.overlayContext.canvas) return
  void (artworkService.artwork.value.frame)
  artworkService.drawOverlay()
})






function mouseDown(mouse: MouseEvent) {
  artworkService.dragOrigin.value = {
    x: mouse.offsetX,
    y: mouse.offsetY,
    data: artworkService.artwork.value.mainContext.getImageData(0, 0, artworkService.artwork.value.bounds.width, artworkService.artwork.value.bounds.height),
    frame: { ...artworkService.artwork.value.frame }
  }
}


function mouseMove(mouse: MouseEvent) {
  if (!artworkService.dragOrigin.value) return

  const dx = (mouse.offsetX - artworkService.dragOrigin.value.x) / artworkService.artwork.value.mainContext.canvas.offsetWidth * artworkService.artwork.value.mainContext.canvas.width
  const dy = (mouse.offsetY - artworkService.dragOrigin.value.y) / artworkService.artwork.value.mainContext.canvas.offsetHeight * artworkService.artwork.value.mainContext.canvas.height
  const snapDx = Math.floor(dx / snapSize.value) * snapSize.value
  const snapDy = Math.floor(dy / snapSize.value) * snapSize.value

  if (toolSelected.value === 'pen') {
    const x = mouse.offsetX / artworkService.artwork.value.mainContext.canvas.offsetWidth * artworkService.artwork.value.mainContext.canvas.width
    const y = mouse.offsetY / artworkService.artwork.value.mainContext.canvas.offsetHeight * artworkService.artwork.value.mainContext.canvas.height
    clearCircle(artworkService.artwork.value.mainContext, x, y, penSize.value / 2)
  } else if (toolSelected.value === 'drag') {
    artworkService.artwork.value.mainContext.clearRect(0, 0, artworkService.artwork.value.bounds.width, artworkService.artwork.value.bounds.height)
    artworkService.artwork.value.mainContext.putImageData(artworkService.dragOrigin.value.data, snapDx, snapDy)
  } else if (toolSelected.value === 'drag-frame') {
    artworkService.artwork.value.frame.x = artworkService.dragOrigin.value.frame.x + snapDx
    artworkService.artwork.value.frame.y = artworkService.dragOrigin.value.frame.y + snapDy
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