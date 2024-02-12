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
import { gestureAnyEvent, type GestureEvent, type ScreenEvent } from "@/lib/GestureEvent";
import { gestureEventToArtboardGestureEvent } from "@/lib/ArtboardGestureEvent";

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

// TODO sometimes when I drag it says no
watchSyncEffect(() => {
  if (!gestureAnyEvent.value) return;
  if (!canvas.value) return;
  const gestureEvent = gestureEventToArtboardGestureEvent(canvas.value, gestureAnyEvent.value);
  // TODO clicking on a button or outside the canvas shouldn't trigger
  selectedTool().gesture(gestureEvent);
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
  user-select: none;
}
</style>
@/services/GestureEvent
