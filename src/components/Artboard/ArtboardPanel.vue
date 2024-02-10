<template>
  <section class="artboard-panel" @pointerdown="pointerDown">
    <div class="fps">{{ artboardState.fps }}fps</div>
    <canvas ref="canvas" class="canvas"></canvas>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watchSyncEffect } from "vue";
import { attachToCanvas, detachCanvas } from "@/components/Artboard/Artboard";
import { useBrushTool } from "@/components/Brush/brushTool";
import { pointerMoveEvent, pointerUpEvent } from "@/services/pointerService";
import { useEraserTool } from "@/components/Eraser/eraserTool";
import { artboardState } from "./artboardState";

const canvas = ref<HTMLCanvasElement>(undefined!);

const tools = [useBrushTool(), useEraserTool()];

onMounted(async () => {
  resizeCanvasToVisible();
  attachToCanvas(canvas.value);
});

onUnmounted(() => {
  detachCanvas();
});

watchSyncEffect(() => {
  if (!pointerUpEvent.value) return;
  selectedTool().pointerUp(pointerUpEvent.value);
});

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
.fps {
  position: fixed;
  bottom: 0;
  left: 0.3em;
  font-size: 0.8em;
}
</style>
