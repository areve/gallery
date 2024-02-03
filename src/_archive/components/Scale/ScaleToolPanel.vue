<template>
  <AppWindow title="Scale" v-model:panelState="panelStates.scale">
    <div>
      <button type="button" @click="artboardService.scaleImage(scaleToolState.scaleImageBy)">Scale image</button>
      <label for="scaleBy">by</label>
      <input type="number" id="scaleBy" v-model="scaleToolState.scaleImageBy" step="0.00001" min="0" />
    </div>
    <div>
      <button type="button" @click="artboardService.scale(0.5)">Shrink</button>
      <button type="button" @click="artboardService.scale(2)">Grow</button>
    </div>
    <div>
      <button type="button" @click="artboardService.growFrame(-512)">Shrink frame</button>
      <button type="button" @click="artboardService.growFrame(512)">Grow frame</button>
    </div>
  </AppWindow>
</template>

<script lang="ts" setup>
import artboardService from "@/components/Artboard/artboardService";
import { panelStates } from "@/components/EditorApp/panelStates";
import { scaleToolState } from "@/components/Scale/scaleToolState";
import AppWindow from "../AppWindow/AppWindow.vue";
</script>

<style scoped></style>
