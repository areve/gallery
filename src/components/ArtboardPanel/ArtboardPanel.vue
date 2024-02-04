<template>
  <section class="artboard-panel" @pointerdown="pointerDown">
    <canvas ref="canvas" class="canvas"></canvas>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watchSyncEffect } from "vue";
import artboardService from "@/components/ArtboardPanel/artboardService";
import { useBrushTool } from "@/components/Brush/brushTool";
import { pointerMoveEvent, pointerUpEvent } from "@/services/pointerService";
import { useEraserTool } from "./eraserTool";
import { artboardState } from "./artboardState";

const canvas = ref<HTMLCanvasElement>(undefined!);
let renderInterval: number | undefined;

const tools = [useBrushTool(), useEraserTool()];

onMounted(async () => {
  resizeCanvasToVisible();
  initializeArtboard();
  renderInterval = setInterval(artboardService.render, 20);
});

onUnmounted(() => {
  clearInterval(renderInterval);
  renderInterval = undefined;
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
  width: 100%;
}
</style>
