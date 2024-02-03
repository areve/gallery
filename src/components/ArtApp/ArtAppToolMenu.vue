<template>
  <button type="button" @click="pencil">Pencil</button>
  <button type="button" @click="eraser">Eraser</button>
</template>

<script lang="ts" setup>
import artboardService from "../ArtboardPanel/artboardService";
import { artAppState } from "./artAppState";

function pencil() {
  artboardService.reset();
  artAppState.value.closeMenus();
}
function eraser() {

  artboardService.reset();
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
</style>./artartAppMenuState
./artAppState