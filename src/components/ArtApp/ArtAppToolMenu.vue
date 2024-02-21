<template>
  <button type="button" @click="pencil">Pencil</button>
  <BrushPanel />
  <button type="button" @click="eraser">Eraser</button>
  <EraserPanel />
</template>

<script lang="ts" setup>
import { artboardState } from "@/components/Artboard/artboardState";
import BrushPanel from "@/components/Brush/BrushPanel.vue";
import EraserPanel from "@/components/Eraser/EraserPanel.vue";

function pencil() {
  artboardState.value.selectedTool = "brush";
}
function eraser() {
  artboardState.value.selectedTool = "eraser";
}
</script>

<style scoped>
button {
  border-radius: 0;
  margin: 0;
  display: block;
  width: 100%;
  color: #fff;
  background-color: #666;
}
</style>
