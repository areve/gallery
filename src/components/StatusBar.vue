<template>
  <div class="status-bar" :hidden="!editorAppState.statusBarVisible">
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
import artboardService from "@/services/artboardService";
import { editorAppState } from "@/services/editorAppState";
</script>

<style scoped></style>
