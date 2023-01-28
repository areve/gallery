<template>
  <div class="layout" @mouseup="mouseUp" @mousedown="mouseDown" @touchend="mouseUp" @touchstart="mouseDown">
    <main class="main">
      <Menu></Menu>
      <Artboard />
      <div :hidden="!formPanelsVisible">
        <section class="tool-panel" :hidden="!formPanelsVisible">
          <h3>Artwork Settings</h3>
          <button type="button" @click="showMetadata = !showMetadata">Toggle Metadata</button>
          <textarea class="metadata" v-model="metadataAsJson" :hidden="!showMetadata"></textarea>
          <input type="text" v-model="artboardService.artwork.value.filename" />
          <button type="button" @click="deleteImage(artboardService.artwork.value.filename)">Delete</button>
        </section>
        <AppSettings />
        <section class="tool-panel" :hidden="!formPanelsVisible">
          <h3>Scale</h3>
          <button type="button" @click="scaleImage(artboardService.artwork.value.context, scaleImageBy)">Scale
            image</button>
          <label for="scaleBy">by</label>
          <input type="number" id="scaleBy" v-model="scaleImageBy" step="0.00001" min="0" />
          <button type="button" @click="artboardService.scale(0.5)">Shrink</button>
          <button type="button" @click="artboardService.scale(2)">Grow</button>
          <button type="button" @click="artboardService.growFrame(-512)">Shrink frame</button>
          <button type="button" @click="artboardService.growFrame(512)">Grow frame</button>
        </section>
        <OpenAiPanel />
      </div>

      <ToolPanel />
      <span class="status-bar" :hidden="!statusBarVisible">
        <span>canvas:{{ artboardService.artwork.value.bounds.width }}x{{
          artboardService.artwork.value.bounds.height
        }}</span>
        <span>frame:{{ artboardService.artwork.value.frame.width }}x{{
          artboardService.artwork.value.frame.height
        }}</span>
      </span>
    </main>
    <aside class="side-panel" :hidden="!galleryPanelVisible">
      <Gallery />
    </aside>
  </div>
</template>

<script lang="ts" setup>
import OpenAiPanel from '@/components/OpenAiPanel.vue'
import Artboard from '@/components/Artboard.vue'
import AppSettings from '@/components/AppSettings.vue'
import Menu from '@/components/Menu.vue'
import Gallery from '@/components/Gallery.vue'
import ToolPanel from '@/components/ToolPanel.vue'

import { computed, onMounted, watch } from 'vue';
import { clone, mostRecentPrompt } from '@/lib/utils';
import { shotgunEffect } from '@/lib/effects';
import { scaleImage } from '@/lib/draw';
import { cloneContext, createContextFromImage } from '@/lib/canvas';

import { onApplyEffect, onAction } from '@/services/appActions'
import { useKeyboardHandler } from '@/services/keyboardHandler';
import { deleteGalleryItem, selectedItem, updateGalleryItem } from '@/services/galleryService';
import openAiService from '@/services/openAiService';
import compositionService, { createLayer } from '@/services/compositionService';
import galleryApi from '@/services/galleryApi';
import { settingsPanelVisible, prompt, scaleImageBy, showMetadata } from '@/services/editorAppState';
import artboardService from '@/services/artboardService'
import type { Artwork } from '@/interfaces/Artwork'
import { mouseUp, mouseDown } from '@/services/mouseService'
import { galleryPanelVisible, statusBarVisible, formPanelsVisible, toolbarVisible } from '@/services/editorAppState';

useKeyboardHandler()

// IDEA make it possible to select multiple images and delete them
// IDEA make it possible to have currently selected image
// IDEA tidy up the controls somehow
// IDEA add drag drop image 
// IDEA add copy paste selection 
// IDEA pan zoom and drag canvas
// IDEA add gallery folders
// IDEA get all the interface hidden and make a good pencil drawing tool
// IDEA make errors easier to dismiss and view details of


const metadataAsJson = computed({
  get: () => {
    return JSON.stringify(artboardService.artwork.value.metadata)
  },
  set: (value: string) => {
    throw ('unimplemented yet')
    return JSON.parse(value)
  }
})

watch(onAction, action => {
  if (action.action === 'save') saveArtwork()
  if (action.action === 'reset') reset()
  if (action.action === 'auto-crop') artboardService.autoCrop()
  if (action.action === 'show-settings') settingsPanelVisible.value = true
})

watch(onApplyEffect, action => {
  if (action.type === 'shotgun') shotgunEffect(artboardService.artwork.value.context)
})

watch(selectedItem, artwork => artwork && galleryItemSelected(artwork))

function reset() {
  artboardService.resetArtwork();
}

async function galleryItemSelected(item: Artwork) {
  artboardService.load(item)
  prompt.value = mostRecentPrompt(item)
}

async function deleteImage(deleteFilename: string) {
  deleteGalleryItem(deleteFilename)
}

async function saveArtwork() {
  const savedArtwork = await artboardService.save()
  updateGalleryItem(savedArtwork)
}


</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: row;
  /* grid-template-columns: 70% 30%; */
  /* grid-template-rows: 100%; */
  /* grid-template-areas: "main sidebar"; */
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
  /* grid-area: main; */
  /* display: grid;
  grid-template-columns: 100%;
  grid-template-rows: min-content auto min-content;
  grid-template-areas:
    "menu"
    "artboard"
    "controls"
  ;*/
  height: 100%;
  background-color: #ccc7;
}

.side-panel {
  /* grid-area: sidebar; */
  flex: 1 0;
  max-width: 30%;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 0.4em;
  background-color: #333;
}

/* 
.metadata {
  width: 100%;
  height: 9.6em;
}

.tool-panel {
  margin: 0.4em;
}

.tool-panel h3 {
  display: none;
} */
</style>
