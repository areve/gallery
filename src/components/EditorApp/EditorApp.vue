<template>
  <div class="layout" @mouseup="pointerUp" @touchend="pointerUp">
    <main class="main">
      <TopMenu></TopMenu>
      <div class="artboard-wrap" @mousedown="pointerDown" @mousemove="pointerMove" @touchstart="pointerDown"
        @touchmove="pointerMove">
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
    <aside class="side-panel" :hidden="!panelsVisibleState.gallery">
      <GalleryPanel />
    </aside>
  </div>
</template>

<script lang="ts" setup>
import ArtworkSettingsPanel from "@/components/Artboard/ArtworkSettingsPanel.vue";
import OpenAiPanel from "@/components/OpenAi/OpenAiPanel.vue";
import ArtboardPanel from "@/components/Artboard/ArtboardPanel.vue";
import AppSettings from "@/components/EditorApp/AppSettings.vue";
import TopMenu from "@/components/EditorApp/TopMenu.vue";
import GalleryPanel from "@/components/Gallery/GalleryPanel.vue";
import ToolPanel from "@/components/Toolbar/ToolPanel.vue";
import PencilPanel from "@/components/Brush/PencilPanel.vue";

import { watch } from "vue";
import { mostRecentPrompt } from "@/lib/artwork-utils";
import { shotgunEffect } from "@/lib/rgba/rgba-effects-shotgun";
import { rgb2rybEffect, ryb2rgbEffect } from "@/lib/rgba/rgba-effects-ryb2rgb";

import { onApplyEffect, onAction } from "@/components/EditorApp/appActions";
import { useKeyboardHandler } from "@/components/EditorApp/keyboardService";
import { selectedItem, updateGalleryItem } from "@/components/Gallery/galleryService";
import { panelsVisibleState } from "@/components/EditorApp/panelsVisibleState"
import artboardService from "@/components/Artboard/artboardService";
import type { Artwork } from "@/interfaces/Artwork";
import { pointerUp, pointerDown, pointerMove } from "@/services/pointerService";
import StatusBar from "@/components/EditorApp/StatusBar.vue";
import ScaleToolPanel from "@/components/Scale/ScaleToolPanel.vue";
import { openAiPanelState } from "@/components/OpenAi/openAiPanelState";

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
  if (action.action === "show-settings") panelsVisibleState.value.settings = true;
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
  openAiPanelState.value.prompt = mostRecentPrompt(item);
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
