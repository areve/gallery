<template>
  <button type="button" @click="pencil">Pencil</button>
  <button type="button" @click="eraser">Eraser</button>
</template>

<script lang="ts" setup>
import { artboardState } from "../ArtboardPanel/artboardState";
import { artAppState } from "./artAppState";

function pencil() {
  artboardState.value.selectedTool = "brush";
  artAppState.value.closeMenus();
}
function eraser() {
  artboardState.value.selectedTool = "eraser";
  artAppState.value.closeMenus();
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
