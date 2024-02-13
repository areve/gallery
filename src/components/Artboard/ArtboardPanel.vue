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
  background-image: linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(135deg, #ddd 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(135deg, transparent 75%, #ddd 75%);
  background-size: 20px 20px;
  background-position: 0 0, 10px 0, 10px -10px, 0px 10px;
  background-repeat: repeat;
}
</style>
