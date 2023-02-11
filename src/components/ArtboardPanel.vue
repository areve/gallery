<template>
  <div class="artboard-panel">
    <div class="artboard-wrap">
      <div class="artboard" :style="{
        'aspect-ratio':
          artboardService.artwork.value.bounds.width +
          ' / ' +
          artboardService.artwork.value.bounds.height,
      }">
        <canvas ref="canvas" class="canvas" @touchstart="mouseDown" @mousedown="mouseDown" @touchmove="mouseMove"
          @mousemove="mouseMove"></canvas>
        <canvas ref="overlayCanvas" class="overlay-canvas" @touchstart="mouseDown" @mousedown="mouseDown"
          @touchmove="mouseMove" @mousemove="mouseMove"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toolSelected } from "@/services/editorAppState";
import { onMounted, ref, watchSyncEffect } from "vue";
import { pointerUpEvent, toPointerEvents } from "@/services/pointerService";
import artboardService, { resetArtwork } from "@/services/artboardService";
import { useBrushTool } from "@/tools/brushTool"
import { useArtboardMoveTool } from "@/tools/artboardMoveTool"
import { useArtboardFrameTool } from "@/tools/artboardFrameTool"
import { useEraserTool } from "@/tools/eraserTool";

const canvas = ref<HTMLCanvasElement>(undefined!);
const overlayCanvas = ref<HTMLCanvasElement>(undefined!);

const tools = [
  useBrushTool(),
  useArtboardMoveTool(),
  useArtboardFrameTool(),
  useEraserTool()
]

function selectedTool() {
  return tools.find(tool => tool.toolType == toolSelected.value) ?? tools[0]
}

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
  if (!pointerUpEvent.value) return
  const pointerEvent = toPointerEvents(
    pointerUpEvent.value,
    artboardService.artwork.value.context
  )[0];

  selectedTool().pointerUp(pointerEvent)
});

function mouseDown(event: MouseEvent | TouchEvent) {
  const pointerEvent = toPointerEvents(
    event,
    artboardService.artwork.value.context
  )[0];
  selectedTool().pointerDown(pointerEvent)
}

function mouseMove(event: MouseEvent | TouchEvent) {
  const pointerEvents = toPointerEvents(
    event,
    artboardService.artwork.value.context
  );
  pointerEvents.forEach((pointerEvent) => {
    pointerEvent.sourceEvent.preventDefault();
  });

  const pointerEvent = pointerEvents[0];
  selectedTool().pointerMove(pointerEvent)
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
