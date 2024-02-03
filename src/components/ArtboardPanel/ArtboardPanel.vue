<template>
  <section class="artboard-panel">
    <canvas ref="canvas" class="canvas"></canvas>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import artboardService from "@/components/ArtboardPanel/artboardService";

const canvas = ref<HTMLCanvasElement>(undefined!);
let intervalHandle: number | undefined;

onMounted(async () => {
  const context = canvas.value.getContext("2d", {
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;
  artboardService.artwork.value.context = context;
  artboardService.reset();
  intervalHandle = setInterval(artboardService.render, 0);
});

onUnmounted(() => {
  clearInterval(intervalHandle);
  intervalHandle = undefined;
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
</style>
