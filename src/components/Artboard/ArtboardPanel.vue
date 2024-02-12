<template>
  <section class="artboard-panel" @pointerdown="pointerDown">
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

watchSyncEffect(() => {
  if (!gestureUpEvent.value) return;
  selectedTool().pointerUp(gestureUpEvent.value);
});

function resizeCanvasToVisible() {
  canvas.value.width = canvas.value.offsetWidth * window.devicePixelRatio;
  canvas.value.height = canvas.value.offsetHeight * window.devicePixelRatio;
}

function pointerDown(event: PointerEvent) {
  //   selectedTool().pointerDown(event);
}

watchSyncEffect(() => {
  if (!gestureDownEvent.value) return;
  // console.log("down", stringifyEvent(gestureDownEvent.value));
  // TODO modifying the event is a bad ideas!
  // TODO need to check the down event is even actually on the canvas
  const gestureEvent = toRaw(gestureDownEvent.value);
  gestureEvent.at = getCanvasPoint(canvas.value, gestureEvent.page);
  selectedTool().pointerDown(gestureEvent);
});

watchSyncEffect(() => {
  if (!gestureMoveEvent.value) return;
  // TODO modifying the event is a bad ideas!
  const gestureEvent = toRaw(gestureMoveEvent.value);
  gestureEvent.at = getCanvasPoint(canvas.value, gestureEvent.page);
  selectedTool().pointerMove(gestureEvent);
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