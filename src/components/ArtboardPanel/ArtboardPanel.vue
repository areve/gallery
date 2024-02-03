<template>
  <section class="artboard-panel" @pointerdown="pointerDown">
    <canvas ref="canvas" class="canvas"></canvas>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watchSyncEffect } from "vue";
import artboardService from "@/components/ArtboardPanel/artboardService";
import { useBrushTool } from "./brushTool";
import { pointerMoveEvent, pointerUpEvent } from "@/services/pointerService";
import { swipeEdgeEvent } from "@/services/swipeEdgeService";
import { resetAll } from "@/lib/bitmap/bitmap-effects-all-color";
import { srgb2oklch } from "@/lib/color/color-oklch";
import { color2srgb } from "@/lib/color/color-string";

const canvas = ref<HTMLCanvasElement>(undefined!);
let renderInterval: number | undefined;

const tools = [useBrushTool()];

onMounted(async () => {
  resizeCanvasToVisible();
  initializeArtboard();
  renderInterval = setInterval(artboardService.render, 0);
});

onUnmounted(() => {
  clearInterval(renderInterval);
  renderInterval = undefined;
});

watchSyncEffect(() => {
  if (!pointerUpEvent.value) return;
  selectedTool().pointerUp(pointerUpEvent.value);
});

watchSyncEffect(() => {
  if (!swipeEdgeEvent.value) return;
  console.log("swipeEdgeEvent", swipeEdgeEvent.value);

  if (swipeEdgeEvent.value.edge === "left") {
    const red = srgb2oklch(color2srgb("red"));
    resetAll(artboardService.artboard.value.bitmapLayer, red);
  } else if (swipeEdgeEvent.value.edge === "right") {
    const red = srgb2oklch(color2srgb("green"));
    resetAll(artboardService.artboard.value.bitmapLayer, red);
  }
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
  return tools[0];
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
</style>
