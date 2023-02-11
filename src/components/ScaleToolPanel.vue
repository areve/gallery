<template>
  <section class="tool-panel" :hidden="!editorAppState.scalePanelsVisible">
    <h3>Scale</h3>
    <button type="button" @click="artboardService.scaleImage(editorAppState.scaleImageBy)">
      Scale image
    </button>
    <label for="scaleBy">by</label>
    <input
      type="number"
      id="scaleBy"
      v-model="editorAppState.scaleImageBy"
      step="0.00001"
      min="0"
    />
    <button type="button" @click="artboardService.scale(0.5)">Shrink</button>
    <button type="button" @click="artboardService.scale(2)">Grow</button>
    <button type="button" @click="artboardService.growFrame(-512)">
      Shrink frame
    </button>
    <button type="button" @click="artboardService.growFrame(512)">
      Grow frame
    </button>
  </section>
</template>

<script lang="ts" setup>
import artboardService from "@/services/artboardService";
import { editorAppState } from "@/services/editorAppState";
</script>

<style scoped></style>
