<template>
  <section class="artboard-panel" @pointerdown="pointerDown">
    <canvas ref="canvas" class="canvas"></canvas>
  </section>
  <div class="multi-canvas">
    <canvas v-for="(canvas, index) in canvases" ref="canvasRefs" :key="index" width="300" height="100"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watchSyncEffect } from "vue";
import artboardService from "@/components/ArtboardPanel/artboardService";
import { useBrushTool } from "@/components/Brush/brushTool";
import { pointerMoveEvent, pointerUpEvent } from "@/services/pointerService";
import { useEraserTool } from "@/components/Eraser/eraserTool";
import { artboardState } from "./artboardState";
import Worker from "@/services/worker?worker";

const canvas = ref<HTMLCanvasElement>(undefined!);
const canvases = ref(new Array(1));
const canvasRefs = ref<HTMLCanvasElement[]>([]);
const workers: Worker[] = [];

let renderInterval: number | undefined;

const tools = [useBrushTool(), useEraserTool()];

onMounted(async () => {
  resizeCanvasToVisible();
  initializeArtboard();
  renderInterval = setInterval(artboardService.render, 20);

  canvasRefs.value.forEach((canvasRef) => {
    const worker = new Worker();
    worker.onmessage = (message: MessageEvent<any>) => console.log(message);
    const offscreen = canvasRef.transferControlToOffscreen();
    worker.postMessage({ canvas: offscreen }, [offscreen]);
    workers.push(worker);
  });
});

onUnmounted(() => {
  clearInterval(renderInterval);
  renderInterval = undefined;
  workers.forEach((worker) => worker.terminate());
});

watchSyncEffect(() => {
  if (!pointerUpEvent.value) return;
  selectedTool().pointerUp(pointerUpEvent.value);
});

function initializeArtboard() {
  const context = canvas.value.getContext("2d", {
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;

  artboardService.artboard.value.context = context;
  artboardService.reset();
}

function resizeCanvasToVisible() {
  canvas.value.width = canvas.value.offsetWidth * window.devicePixelRatio;
  canvas.value.height = canvas.value.offsetHeight * window.devicePixelRatio;
}

function pointerDown(event: PointerEvent) {
  selectedTool().pointerDown(event);
}

watchSyncEffect(() => {
  if (!pointerMoveEvent.value) return;
  selectedTool().pointerMove(pointerMoveEvent.value);
});

function selectedTool() {
  return tools.find((tool) => tool.toolType === artboardState.value.selectedTool) || tools[0];
}
</script>

<style scoped>
.artboard-panel {
  flex: 1 0;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.canvas {
  display: none;
  width: 100%;
}

.multi-canvas {
  /* background-color: red; */
  position: relative;
  top: 5%;
  left: 5%;
  z-index: 100;
  height: 100px;
  border: 2px solid cyan;
  background: yellow;
}
</style>
