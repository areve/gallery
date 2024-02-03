<template>
  <button type="button" @click="reset">Reset</button>
</template>

<script lang="ts" setup>
import artboardService from "../ArtboardPanel/artboardService";
import { appMenuState } from "./appMenuState";

function reset() {
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
