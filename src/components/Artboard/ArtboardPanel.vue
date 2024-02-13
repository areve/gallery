<template>
  <section class="artboard-panel">
    <div class="artboard-wrap">
      <div
        class="artboard"
        :style="{
          'aspect-ratio': dimensions.x + ' / ' + dimensions.y,
        }"
      >
        <canvas ref="canvas" class="canvas" @dragstart="ignoreEvent"></canvas>
      </div>
    </div>
  </section>
  <div class="status-bar">{{ artboardState.fps }}fps {{ dimensions }}</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watchSyncEffect } from "vue";
import { artboardState } from "./artboardState";
import { gestureAnyEvent } from "@/lib/GestureEvent";
import { gestureEventToArtboardGestureEvent } from "@/lib/ArtboardGestureEvent";
import { attachCanvas, detachCanvas, selectedTool } from "./artboardService";
import type { Coord } from "@/lib/Coord";

const canvas = ref<HTMLCanvasElement>(undefined!);
const dimensions = ref<Coord>({ x: 1024, y: 1024 });

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
  // TODO I had a nice margin like "artboard-wrap { margin: 0.4em; }" but removed it because of this method of setting the canvas size on start
  const body = document.body;

  canvas.value.width = body.offsetWidth * window.devicePixelRatio;
  canvas.value.height = body.offsetHeight * window.devicePixelRatio;
  dimensions.value = {
    x: canvas.value.width,
    y: canvas.value.height,
  };
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
  background-color: black;
}

.canvas {
  position: absolute;
  width: 100%;
  height: 100%;
}

.status-bar {
  position: fixed;
  bottom: 0;
  left: 0.2em;
  bottom: 0.2em;
  font-size: 0.8em;
  user-select: none;
  background-color: rgb(0, 0, 0, 0.5);
  border-radius: 0.5em;
  padding: 0 0.5em;
  color: white;
}

.artboard-wrap {
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
