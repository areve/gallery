<template>
  <aside class="left-menu">
    <button type="button" @click="brush">brush</button>
    <BrushPanel />
    <button type="button" @click="eraser">Eraser</button>
    <EraserPanel />
  </aside>
</template>

<script lang="ts" setup>
import { artboardState } from "@/components/Artboard/artboardState";
import BrushPanel from "@/components/Brush/BrushPanel.vue";
import EraserPanel from "@/components/Eraser/EraserPanel.vue";

function brush() {
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
.left-menu {
  position: fixed;
  width: 20%;
  height: 100%;
  background-color: rgb(127, 127, 127, 0.95);
  z-index: 50;
  transition: 0.2s ease-in-out;
  transition-property: opacity, left, right;
  overflow: hidden;
  left: 0;
  opacity: 1;
  width: 45%;
  box-shadow: 0em 0em 0.5em rgb(0, 0, 0, 0.8);
}

.left-menu[hidden] {
  left: -45%;
  opacity: 0.5;
  display: block !important;
}
</style>
