<template>
  <button class="edge-button" type="button" @click="nothing"></button>
</template>

<script lang="ts" setup>
import { progressMessage } from "../Progress/progressState";

function nothing() {
  progressMessage("button does nothing yet", 2);
  setTimeout(() => progressMessage("done"), 2000);
}
</script>

<style scoped>
.edge-button {
  border-radius: 3em;
  position: fixed;
  left: -3em;
  top: 50%;
  z-index: 200;
  width: 6em;
  height: 6em;
  box-shadow: 0em 0em 0.5em rgb(0, 0, 0, 0.8);
  opacity: 0.6;
}
</style>
