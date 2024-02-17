<template>
  <section class="artboard-panel">
    <div class="artboard-wrap">
      <div
        class="artboard"
        :style="{
          'aspect-ratio': artboardState.dimensions.x + ' / ' + artboardState.dimensions.y,
        }"
      >
        <canvas ref="canvas" class="canvas" @dragstart="ignoreEvent"></canvas>
      </div>
    </div>
  </section>
  <div v-if="artAppState.showFps" class="status-bar">{{ artboardState.fps }}fps {{ artboardState.dimensions }}</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watchSyncEffect } from "vue";
import { artboardState } from "./artboardState";
import { gestureAnyEvent } from "@/lib/GestureEvent";
import { gestureEventToArtboardGestureEvent } from "@/lib/ArtboardGestureEvent";
import { attachCanvas, detachCanvas, selectedTool } from "./artboardService";
import { getAvailableSize } from "@/lib/utils";
import { artAppState } from "../ArtApp/artAppState";

const canvas = ref<HTMLCanvasElement>(undefined!);

function ignoreEvent(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  event.dataTransfer?.clearData();
}

onMounted(async () => {
  resizeArtboardToAvailable();
  attachCanvas(canvas.value);
});

onUnmounted(() => {
  detachCanvas();
});

watchSyncEffect(() => {
  if (!gestureAnyEvent.value) return;
  if (!canvas.value) return;
  if (gestureAnyEvent.value.firstEvent.target !== canvas.value) return;
  const gestureEvent = gestureEventToArtboardGestureEvent(canvas.value, gestureAnyEvent.value);
  selectedTool().gesture(gestureEvent);
});

function resizeArtboardToAvailable() {
  artboardState.value.dimensions = getAvailableSize();
}
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
  background-position:
    0 0,
    10px 0,
    10px -10px,
    0px 10px;
  background-repeat: repeat;
}
</style>
