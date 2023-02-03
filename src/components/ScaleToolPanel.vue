<template>
  <section class="tool-panel" :hidden="!scalePanelsVisible">
    <h3>Scale</h3>
    <button
      type="button"
      @click="scaleImage(artboardService.artwork.value.context, scaleImageBy)"
    >
      Scale image
    </button>
    <label for="scaleBy">by</label>
    <input
      type="number"
      id="scaleBy"
      v-model="scaleImageBy"
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
import { scaleImage } from "@/lib/draw";
import artboardService from "@/services/artboardService";
import { scalePanelsVisible, scaleImageBy } from "@/services/editorAppState";
</script>

<style scoped></style>
