<template>
  <div class="layout" @mouseup="mouseUp">
    <main class="main">
      <Menu></Menu>
      <section class="prompt-panel">
        <textarea type="text" id="prompt" v-model="prompt"></textarea>
      </section>
      <section class="tool-panel">
        <h3>Document Settings</h3>
        <button type="button" @click="showMetadata = !showMetadata">Toggle Metadata</button>
        <textarea class="metadata" v-model="metadataAsJson" v-if="showMetadata"></textarea>
        <input type="text" v-model="artworkService.artwork.value.filename" />
        <button type="button" @click="deleteImage(artworkService.artwork.value.filename)">Delete</button>
      </section>
      <AppSettings />
      <section class="tool-panel">
        <h3>Scale</h3>
        <button type="button" @click="scaleImage(artworkService.artwork.value.documentContext, scaleImageBy)">Scale
          image</button>
        <label for="scaleBy">by</label>
        <input type="number" id="scaleBy" v-model="scaleImageBy" step="0.00001" min="0" />
        <button type="button" @click="artworkService.scale(0.5)">Shrink</button>
        <button type="button" @click="artworkService.scale(2)">Grow</button>
        <button type="button" @click="artworkService.growFrame(-512)">Shrink frame</button>
        <button type="button" @click="artworkService.growFrame(512)">Grow frame</button>
      </section>
      <section class="tool-panel">
        <h3>OpenAI</h3>
        <button type="button" @click="generateImage()">Generate</button>
        <button type="button" @click="variationImage()">Variation</button>
        <button type="button" @click="outpaintImage()">Outpaint</button>
      </section>
      <ToolPanel />
      <Document />

      <span class="status-bar">
        <span>canvas:{{ artworkService.artwork.value.bounds.width }}x{{
          artworkService.artwork.value.bounds.height
        }}</span>
        <span>frame:{{ artworkService.artwork.value.frame.width }}x{{
          artworkService.artwork.value.frame.height
        }}</span>
      </span>
    </main>
    <aside class="side-panel">
      <Gallery />
    </aside>
  </div>
</template>

<script lang="ts" setup>
import Document from '@/components/Document.vue'
import AppSettings from '@/components/AppSettings.vue'
import Menu from '@/components/Menu.vue'
import Gallery from '@/components/Gallery.vue'
import ToolPanel from '@/components/ToolPanel.vue'

import { computed, onMounted, ref, watch } from 'vue';
import { clone, mostRecentPrompt, rectanglesIntersect } from '@/lib/utils';
import { shotgunEffect } from '@/lib/effects';
import { scaleImage } from '@/lib/draw';
import { cloneContext, createContext, autoCropImage, createContextFromImage } from '@/lib/canvas';

import { onApplyEffect, onSelectTool, onAction } from '@/services/appActions'
import { useKeyboardHandler } from '@/services/keyboardHandler';
import { deleteGalleryItem, loadGalleryItem, onSelected, saveGalleryItem } from '@/services/galleryService';
import openAiService from '@/services/openAiService';
import compositionService, { createLayer } from '@/services/compositionService';
import galleryApi from '@/services/galleryApi';
import { panel, toolSelected } from '@/services/appState';
import artworkService from '@/services/artworkService'
import type { GalleryItem } from '@/interfaces/GalleryItem'
import type { GalleryMetadata } from '@/interfaces/GalleryMetadata'

useKeyboardHandler()

// TODO make it possible to select multiple images and delete them
// TODO make it possible to have currently selected image
// TODO tidy up the controls somehow
// TODO add drag drop image 
// TODO add copy paste selection 
// TODO pan zoom and drag canvas
// TODO add gallery folders

const prompt = ref<string>('')
const showMetadata = ref<boolean>(false)
const scaleImageBy = ref<number>(0.5)

const metadataAsJson = computed({
  get: () => {
    return JSON.stringify(artworkService.artwork.value.metadata)
  },
  set: (value: string) => {
    throw ('unimplemented yet')
    return JSON.parse(value)
  }
})

watch(onAction, action => {
  if (action.action === 'save') saveDocument()
  if (action.action === 'reset') reset()
  if (action.action === 'auto-crop') artworkService.autoCrop()
  if (action.action === 'show-settings') panel.value.settings.visible = true
})

watch(onApplyEffect, action => {
  if (action.type === 'shotgun') shotgunEffect(artworkService.artwork.value.documentContext)
})
watch(onSelectTool, action => toolSelected.value = action.tool)

watch(onSelected, action => galleryItemSelected(action.item))

onMounted(async () => {
  await loadState()
})

function loadState() {
  openAiService.openApiKey.value = window.localStorage.getItem('openApiKey') || ''
  reset()
  artworkService.artwork.value.metadata = JSON.parse(window.localStorage.getItem('metadata') || '')
  prompt.value = window.localStorage.getItem('prompt') || ''
  artworkService.artwork.value.filename = window.localStorage.getItem('filename') || ''
}

function saveState() {
  window.localStorage.setItem('metadata', JSON.stringify(artworkService.artwork.value.metadata))
  window.localStorage.setItem('prompt', prompt.value)
  window.localStorage.setItem('filename', artworkService.artwork.value.filename)
}

function reset() {
  // TODO plenty more to reset?
  prompt.value = ''
  artworkService.resetArtwork();
}

async function galleryItemSelected(item: GalleryItem) {
  artworkService.load(item)
  prompt.value = mostRecentPrompt(item)
  saveState()
}

async function deleteImage(deleteFilename: string) {
  deleteGalleryItem(deleteFilename)
}

async function saveDocument() {
  artworkService.save()
  saveState()
}

async function generateImage() {
  await openAiService.generate({
    prompt: prompt.value,
  })
}

async function variationImage() {
  await openAiService.variation({
    image: artworkService.createContextFromFrame(1024, 1024),
    metadata: artworkService.artwork.value.metadata
  })
}

async function outpaintImage() {
  const outpaintImage_saveBeforeOutpaint = false
  if (outpaintImage_saveBeforeOutpaint) {
    await compositionService.flatten({
      metadata: artworkService.artwork.value.metadata,
      width: artworkService.artwork.value.documentContext.canvas.width,
      height: artworkService.artwork.value.documentContext.canvas.height,
      layers: [
        createLayer(artworkService.artwork.value.documentContext)
      ]
    })
  }

  const compositionRequired = artworkService.artwork.value.frame.height !== 1024 ||
    artworkService.artwork.value.frame.width !== 1024 ||
    artworkService.artwork.value.frame.width !== artworkService.artwork.value.bounds.width ||
    artworkService.artwork.value.frame.height !== artworkService.artwork.value.bounds.height

  const compositionData = compositionRequired ? {
    documentContext: cloneContext(artworkService.artwork.value.documentContext),
    frame: clone(artworkService.artwork.value.frame)
  } : null

  const outpaintResult = await openAiService.outpaint({
    prompt: prompt.value,
    image: artworkService.createContextFromFrame(1024, 1024),
    metadata: artworkService.artwork.value.metadata
  })

  if (compositionData && outpaintResult) {
    await compositionService.flatten({
      metadata: artworkService.artwork.value.metadata,
      width: compositionData.documentContext.canvas.width,
      height: compositionData.documentContext.canvas.height,
      layers: [
        {
          context: createContextFromImage(await galleryApi.getGalleryItem(outpaintResult.filename)),
          x: compositionData.frame.x,
          y: compositionData.frame.y,
          width: compositionData.frame.width,
          height: compositionData.frame.height
        },
        createLayer(compositionData.documentContext)
      ]
    })
  }
}


// TODO some mouse service?
function mouseUp(mouse: MouseEvent) {
  artworkService.mouseUp(mouse)
}

</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 70% 30%;
  grid-template-rows: 100%;
  grid-template-areas: "main sidebar";
  height: 100%;
}

.main {
  grid-area: main;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: min-content auto min-content;
  grid-template-areas:
    "menu"
    "controls"
    "document"
  ;
  height: 100%;
  background-color: #ccc7;
}

.prompt-panel {
  padding: 0.4em;
  grid-area: document;
  overflow: hidden;
  position: relative;
}

.side-panel {
  grid-area: sidebar;
  overflow-y: scroll;
  padding: 0.4em;
  background-color: #ccc7;
}

#prompt {
  resize: none;
  width: 100%;
  height: 3.2em;
}

.metadata {
  width: 100%;
  height: 9.6em;
}

.tool-panel {
  margin: 0.4em;
}

.tool-panel h3 {
  display: none;
}
</style>
