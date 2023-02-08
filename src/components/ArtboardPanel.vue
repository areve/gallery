<template>
  <div class="artboard-panel">
    <div class="artboard-wrap">
      <div
        class="artboard"
        :style="{
          'aspect-ratio':
            artboardService.artwork.value.bounds.width +
            ' / ' +
            artboardService.artwork.value.bounds.height,
        }"
      >
        <canvas
          ref="canvas"
          class="canvas"
          @touchstart="mouseDown"
          @mousedown="mouseDown"
          @touchmove="mouseMove"
          @mousemove="mouseMove"
        ></canvas>
        <canvas
          ref="overlayCanvas"
          class="overlay-canvas"
          @touchstart="mouseDown"
          @mousedown="mouseDown"
          @touchmove="mouseMove"
          @mousemove="mouseMove"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  eraserSize,
  snapSize,
  toolSelected,
} from "@/services/editorAppState";
import { onMounted, ref, watchSyncEffect } from "vue";
import { globalDragOrigin, toPointerEvents } from "@/services/mouseService";
import type { DragOrigin } from "@/interfaces/DragOrigin";
import artboardService, { resetArtwork } from "@/services/artboardService";
import { clearCircle } from "@/lib/rgba/rgba-draw";
import { pencilDrag, pencilLift } from "@/services/brushService";

const dragOrigin = ref<DragOrigin | null>();
const canvas = ref<HTMLCanvasElement>(undefined!);
const overlayCanvas = ref<HTMLCanvasElement>(undefined!);

onMounted(async () => {
  artboardService.artwork.value.context = canvas.value.getContext("2d", {
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;
  artboardService.artwork.value.overlayContext = overlayCanvas.value.getContext(
    "2d",
    { willReadFrequently: true }
  ) as CanvasRenderingContext2D;
  resetArtwork();
});

watchSyncEffect(() => {
  if (!artboardService.artwork.value.context) return;
  if (!artboardService.artwork.value.overlayContext) return;
  artboardService.artwork.value.context.canvas.height =
    artboardService.artwork.value.bounds.height;
  artboardService.artwork.value.context.canvas.width =
    artboardService.artwork.value.bounds.width;
  artboardService.artwork.value.overlayContext.canvas.height =
    artboardService.artwork.value.bounds.height;
  artboardService.artwork.value.overlayContext.canvas.width =
    artboardService.artwork.value.bounds.width;
});

watchSyncEffect(() => {
  if (!artboardService.artwork.value.context) return;
  if (!artboardService.artwork.value.overlayContext) return;
  void artboardService.artwork.value.frame;
  artboardService.renderOverlay();
});

watchSyncEffect(() => {
  if (globalDragOrigin.value) return;
  dragOrigin.value = null;
  pencilLift()
});

function mouseDown(event: MouseEvent | TouchEvent) {
  const { point } = toPointerEvents(event, artboardService.artwork.value.context)[0];

  dragOrigin.value = {
    x: point.x,
    y: point.y,
    data: artboardService.artwork.value.context.getImageData(
      0,
      0,
      artboardService.artwork.value.bounds.width,
      artboardService.artwork.value.bounds.height
    ),
    frame: { ...artboardService.artwork.value.frame },
  };
}

function mouseMove(event: MouseEvent | TouchEvent) {
  if (!dragOrigin.value) return;
  const pointerEvents = toPointerEvents(event, artboardService.artwork.value.context);
  pointerEvents.forEach((pointerEvent) => {
    pointerEvent.sourceEvent.preventDefault();
  });

  const pointerEvent = pointerEvents[0]
  const dx =
    ((pointerEvent.point.x - dragOrigin.value.x) /
      artboardService.artwork.value.context.canvas.offsetWidth) *
    artboardService.artwork.value.context.canvas.width;
  const dy =
    ((pointerEvent.point.y - dragOrigin.value.y) /
      artboardService.artwork.value.context.canvas.offsetHeight) *
    artboardService.artwork.value.context.canvas.height;
  const snapDx = Math.floor(dx / snapSize.value) * snapSize.value;
  const snapDy = Math.floor(dy / snapSize.value) * snapSize.value;

  if (toolSelected.value === "eraser") {
    canvas
    clearCircle(
      artboardService.artwork.value.rgbaLayer,
      pointerEvent.canvasPoint.x,
      pointerEvent.canvasPoint.y,
      eraserSize.value / 2
    );
  } else if (toolSelected.value === "drag") {
    artboardService.artwork.value.context.clearRect(
      0,
      0,
      artboardService.artwork.value.bounds.width,
      artboardService.artwork.value.bounds.height
    );
    artboardService.artwork.value.context.putImageData(
      dragOrigin.value.data,
      snapDx,
      snapDy
    );
    artboardService.resetRgbaLayer();
  } else if (toolSelected.value === "drag-frame") {
    artboardService.artwork.value.frame.x = dragOrigin.value.frame.x + snapDx;
    artboardService.artwork.value.frame.y = dragOrigin.value.frame.y + snapDy;
  } else if (toolSelected.value === "pencil") {
    pencilDrag(
        artboardService.artwork.value.rgbaLayer,
        pointerEvent
      );

  }
}

const render = () => {
  artboardService.render();
  setTimeout(render, 50);
};
render();
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
  background-image: linear-gradient(45deg, #ddd 25%, transparent 25%),
    linear-gradient(135deg, #ddd 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ddd 75%),
    linear-gradient(135deg, transparent 75%, #ddd 75%);
  background-size: 20px 20px;
  background-position: 0 0, 10px 0, 10px -10px, 0px 10px;
  background-repeat: repeat;
}

.canvas {
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
