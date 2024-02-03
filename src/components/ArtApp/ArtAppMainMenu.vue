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

<style scoped></style>
