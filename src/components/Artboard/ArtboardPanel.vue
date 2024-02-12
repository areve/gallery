<template>
  <section class="artboard-panel">
    <div class="fps">{{ artboardState.fps }}fps</div>
    <canvas ref="canvas" class="canvas" @dragstart="ignoreEvent"></canvas>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watchSyncEffect } from "vue";
import { artboardState } from "./artboardState";
import { gestureAnyEvent } from "@/lib/GestureEvent";
import { gestureEventToArtboardGestureEvent } from "@/lib/ArtboardGestureEvent";
import { attachCanvas, detachCanvas, selectedTool } from "./artboardService";

const canvas = ref<HTMLCanvasElement>(undefined!);

function ignoreEvent(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  event.dataTransfer?.clearData();
}

onMounted(async () => {
  resizeCanvasToVisible();
  attachCanvas(canvas.value);
});

onUnmounted(() => {
  detachCanvas();
});

function resizeCanvasToVisible() {
  canvas.value.width = canvas.value.offsetWidth * window.devicePixelRatio;
  canvas.value.height = canvas.value.offsetHeight * window.devicePixelRatio;
}

watchSyncEffect(() => {
  if (!gestureAnyEvent.value) return;
  if (!canvas.value) return;
  if (gestureAnyEvent.value.firstEvent.target !== canvas.value) return;
  const gestureEvent = gestureEventToArtboardGestureEvent(canvas.value, gestureAnyEvent.value);
  selectedTool().gesture(gestureEvent);
});
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
