<template>
  <button type="button" @click="pencil">Pencil</button>
  <button type="button" @click="eraser">Eraser</button>
</template>

<script lang="ts" setup>
import artboardService from "../ArtboardPanel/artboardService";
import { appMenuState } from "./appMenuState";

function pencil() {
  artboardService.reset();
  appMenuState.value.close();
}
function eraser() {
  artboardService.reset();
  appMenuState.value.close();
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
