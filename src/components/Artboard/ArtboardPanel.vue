<template>
  <section class="artboard-panel">
    <div class="fps">{{ artboardState.fps }}fps</div>
    <canvas ref="canvas" class="canvas"></canvas>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, toRaw, watchSyncEffect } from "vue";
import { attachToCanvas, detachCanvas } from "@/components/Artboard/Artboard";
import { useBrushTool } from "@/components/Brush/brushTool";
import { useEraserTool } from "@/components/Eraser/eraserTool";
import { artboardState } from "./artboardState";
import type { Coord } from "@/lib/Coord";
import { gestureDownEvent, gestureMoveEvent, gestureUpEvent } from "@/lib/GestureEvent";

//TODO make the fps display a statusbar, and not selectable
const canvas = ref<HTMLCanvasElement>(undefined!);

const tools = [useBrushTool(), useEraserTool()];

onMounted(async () => {
  resizeCanvasToVisible();
  attachToCanvas(canvas.value);
});

onUnmounted(() => {
  detachCanvas();
});

function resizeCanvasToVisible() {
  canvas.value.width = canvas.value.offsetWidth * window.devicePixelRatio;
  canvas.value.height = canvas.value.offsetHeight * window.devicePixelRatio;
}

watchSyncEffect(() => {
  if (!gestureMoveEvent.value) return;
  if (!canvas.value) return;
  // TODO modifying the event is a bad ideas!
  const gestureEvent = toRaw(gestureMoveEvent.value);
  gestureEvent.currentEvent.at = getCanvasPoint(canvas.value, gestureEvent.currentEvent.page);
  if (gestureEvent.previousEvent) gestureEvent.previousEvent.at = getCanvasPoint(canvas.value, gestureEvent.previousEvent.page);
  selectedTool().gesture(gestureEvent);
});

function selectedTool() {
  return tools.find((tool) => tool.toolType === artboardState.value.selectedTool) || tools[0];
}

function getCanvasPoint(canvas: HTMLCanvasElement, eventPoint: Coord): Coord {
  const domRect = canvas.getBoundingClientRect();
  return {
    x: ((eventPoint.x - domRect.x) / domRect.width) * canvas.width,
    y: ((eventPoint.y - domRect.y) / domRect.height) * canvas.height,
  };
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
@/services/GestureEvent
