<template>
  <div
    class="layout"
    @mouseup="mouseUp"
    @mousedown="mouseDown"
    @touchend="mouseUp"
    @touchstart="mouseDown"
  >
    <main class="main">
      <TopMenu></TopMenu>
      <div class="artboard-wrap">
        <ArtboardPanel />
        <PencilPanel />
      </div>

      <ArtworkSettingsPanel />
      <AppSettings />
      <ScaleToolPanel />
      <OpenAiPanel />
      <ToolPanel />
      <StatusBar />
    </main>
    <aside class="side-panel" :hidden="!galleryPanelVisible">
      <GalleryPanel />
    </aside>
  </div>
</template>

<script lang="ts" setup>
import ArtworkSettingsPanel from "@/components/ArtworkSettingsPanel.vue";
import OpenAiPanel from "@/components/OpenAiPanel.vue";
import ArtboardPanel from "@/components/ArtboardPanel.vue";
import AppSettings from "@/components/AppSettings.vue";
import TopMenu from "@/components/TopMenu.vue";
import GalleryPanel from "@/components/GalleryPanel.vue";
import ToolPanel from "@/components/ToolPanel.vue";
import PencilPanel from "@/components/PencilPanel.vue";

import { watch } from "vue";
import { mostRecentPrompt } from "@/lib/artwork-utils";
import { shotgunEffect } from "@/lib/rgba/rgba-effects-shotgun";
import {
  rgb2rybEffect,
  ryb2rgbEffect,
} from "@/lib/rgba/rgba-effects-ryb2rgb";

import { onApplyEffect, onAction } from "@/services/appActions";
import { useKeyboardHandler } from "@/services/keyboardHandler";
import { selectedItem, updateGalleryItem } from "@/services/galleryService";
import { settingsPanelVisible, prompt } from "@/services/editorAppState";
import artboardService from "@/services/artboardService";
import type { Artwork } from "@/interfaces/Artwork";
import { mouseUp, mouseDown } from "@/services/mouseService";
import { galleryPanelVisible } from "@/services/editorAppState";
import StatusBar from "@/components/StatusBar.vue";
import ScaleToolPanel from "@/components/ScaleToolPanel.vue";

useKeyboardHandler();

// IDEA make it possible to select multiple images and delete them
// IDEA make it possible to have currently selected image
// IDEA tidy up the controls somehow
// IDEA add drag drop image
// IDEA add copy paste selection
// IDEA pan zoom and drag canvas
// IDEA add gallery folders
// IDEA get all the interface hidden and make a good pencil drawing tool
// IDEA make errors easier to dismiss and view details of

watch(onAction, (action) => {
  if (action.action === "save") saveArtwork();
  if (action.action === "reset") reset();
  if (action.action === "auto-crop") artboardService.autoCrop();
  if (action.action === "show-settings") settingsPanelVisible.value = true;
});

watch(onApplyEffect, (action) => {
  if (action.type === "shotgun")
    shotgunEffect(artboardService.artwork.value.rgbaLayer);
  if (action.type === "ryb2rgb")
    ryb2rgbEffect(artboardService.artwork.value.rgbaLayer);
  if (action.type === "rgb2ryb")
    rgb2rybEffect(artboardService.artwork.value.rgbaLayer);
});

watch(selectedItem, (artwork) => artwork && galleryItemSelected(artwork));

function reset() {
  artboardService.resetArtwork();
}

async function galleryItemSelected(item: Artwork) {
  artboardService.load(item);
  prompt.value = mostRecentPrompt(item);
}

async function saveArtwork() {
  const savedArtwork = await artboardService.save();
  updateGalleryItem(savedArtwork);
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.layout.side-panel-closed {
  grid-template-columns: 100%;
}

.main {
  display: flex;
  flex-direction: column;
  flex: 1 0;
  width: 70%;
  height: 100%;
  background-color: #ccc7;
}

.side-panel {
  flex: 1 0;
  max-width: 30%;
  overflow-y: scroll;
  overflow-x: hidden;
}

.artboard-wrap {
  flex: 1 0;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: row;

  overflow: hidden;
}
</style>
