<template>
  <div class="status-bar" :hidden="!panelStates.statusBar.visible" @click="changeStatusBar">
    <div v-if="statusbarState.mode === 'dimenensions'">
      <span>canvas:{{ artboardService.artwork.value.bounds.width }}x{{ artboardService.artwork.value.bounds.height }}</span>
      <span>frame:{{ artboardService.artwork.value.frame.width }}x{{ artboardService.artwork.value.frame.height }}</span>
    </div>
    <div v-if="statusbarState.mode === 'openai'">{{ openAiPanelState.prompt }} &nbsp; {{ loginState }}</div>
    <div v-if="statusbarState.mode === 'filename'">{{ artboardService.artwork.value.filename }} &nbsp;</div>
  </div>
</template>

<script lang="ts" setup>
import artboardService from "@/components/Artboard/artboardService";
import { panelStates } from "@/components/EditorApp/panelStates";
import { openAiPanelState } from "../OpenAi/openAiPanelState";
import { loginState } from "./loginState";
import { statusBarModes, statusbarState } from "./statusBarState";

function changeStatusBar() {
  const mode = statusbarState.value.mode;
  statusbarState.value.mode = statusBarModes[(statusBarModes.indexOf(mode) + 1) % statusBarModes.length];
}
</script>

<style scoped>
.status-bar {
  padding: 0 0.25em;
  background-color: #000;
  color: #999;
  text-align: center;
}
</style>
