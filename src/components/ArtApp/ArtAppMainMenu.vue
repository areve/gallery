<template>
  <button type="button" @click="reset">Reset</button>
  <button type="button" @click="resetOrange">Reset orange</button>
</template>

<script lang="ts" setup>
import artboardService from "../ArtboardPanel/artboardService";
import { artAppState } from "./artAppState";

function reset() {
  artboardService.reset();
  artAppState.value.closeMenus();
}
function resetOrange() {
  artboardService.resetOrange();
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
