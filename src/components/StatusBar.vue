<template>
  <div class="status-bar" :hidden="!panelsVisibleState.statusBar">
    <span
      >canvas:{{ artboardService.artwork.value.bounds.width }}x{{
        artboardService.artwork.value.bounds.height
      }}</span
    >
    <span
      >frame:{{ artboardService.artwork.value.frame.width }}x{{
        artboardService.artwork.value.frame.height
      }}</span
    >
  </div>
</template>

<script lang="ts" setup>
import artboardService from "@/components/Artboard/artboardService";
import { panelsVisibleState } from "@/states/panelsVisibleState"
</script>

<style scoped></style>
