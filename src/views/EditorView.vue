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
        <input type="text" v-model="filename" />
        <button type="button" @click="deleteImage(filename)">Delete</button>
      </section>
      <AppSettings />
      <section class="tool-panel">
        <h3>Scale</h3>
        <button type="button" @click="scaleImage(documentContext, scaleImageBy)">Scale image</button>
        <label for="scaleBy">by</label>
        <input type="number" id="scaleBy" v-model="scaleImageBy" step="0.00001" min="0" />
        <button type="button" @click="scaleDocumentCanvas(0.5)">Shrink</button>
        <button type="button" @click="scaleDocumentCanvas(2)">Grow</button>
        <button type="button" @click="growFrame(-512)">Shrink frame</button>
        <button type="button" @click="growFrame(512)">Grow frame</button>
      </section>
      <section class="tool-panel">
        <h3>OpenAI</h3>
        <button type="button" @click="generateImage()">Generate</button>
        <button type="button" @click="variationImage()">Variation</button>
        <button type="button" @click="outpaintImage()">Outpaint</button>
      </section>
      <ToolPanel />
      <Document @resize="onresize" @ready="onready" :width="bounds.width" :height="bounds.height" />

      <span class="status-bar">
        <span>canvas:{{ bounds.width }}x{{ bounds.height }}</span>
        <span>frame:{{ frame.width }}x{{ frame.height }}</span>
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

import { computed, onMounted, ref, watch, type Ref } from 'vue';
import type { GalleryItem, GalleryMetadata, Rect, DocumentVueReady } from '@/interfaces/EditorView-interfaces';
import { clone, mostRecentPrompt, rectanglesIntersect } from './EditorView-utils';
import { shotgunEffect } from './EditorView/effects';
import { scaleImage } from './EditorView/draw';
import { cloneContext, createContext, autoCropImage, createContextFromImage } from './EditorView/canvas';


import { onApplyEffect, onSelectTool, onAction } from '@/services/appActions'
import { useKeyboardHandler } from '@/services/keyboardHandler';
import { deleteGalleryItem, loadGalleryItem, onSelected, saveGalleryItem } from '@/services/galleryService';
import openAiService from '@/services/openAiService';
import compositionService, { createLayer } from '@/services/compositionService';
import galleryApi from '@/services/galleryApi';
import { panel, toolSelected } from '@/services/appState';

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
const filename = ref<string>('')
const metadata = ref<GalleryMetadata>({ history: [] })

let frame = ref<Rect>({
  x: 0,
  y: 0,
  width: 1024,
  height: 1024,
})

let bounds = ref<Rect>({
  x: 0,
  y: 0,
  width: 1024,
  height: 1024,
})
let resetFrame: Function;

const metadataAsJson = computed({
  get: () => {
    return JSON.stringify(metadata.value)
  },
  set: (value: string) => {
    throw ('unimplemented yet')
    return JSON.parse(value)
  }
})

// const documentContext = ref<CanvasRenderingContext2D>({} as CanvasRenderingContext2D)
let documentContext: CanvasRenderingContext2D
// const overlayContext = ref<CanvasRenderingContext2D>({} as CanvasRenderingContext2D)




watch(onAction, action => {
  if (action.action === 'save') saveDocument()
  if (action.action === 'reset') resetDocument()
  if (action.action === 'auto-crop') autoCrop()
  if (action.action === 'show-settings') panel.value.settings.visible = true
})

watch(onApplyEffect, action => {
  if (action.type === 'shotgun') shotgunEffect(documentContext)
})
watch(onSelectTool, action => toolSelected.value = action.tool)

watch(onSelected, action => galleryItemSelected(action.item))

onMounted(async () => {
  await loadState()
})

let documentMouseUp = function () { } as Function
let drawOverlay = function () { } as Function

function onresize(widthz: number, heightz: number) {
  console.log('reszie', widthz, heightz)
  bounds.value.width = widthz
  bounds.value.height = heightz
}

function onready(ready: DocumentVueReady) {
  documentContext = ready.documentContext
  frame = ready.frame
  bounds = ready.bounds
  resetFrame = ready.resetFrame
  documentMouseUp = ready.mouseUp
}

function loadState() {
  openAiService.openApiKey.value = window.localStorage.getItem('openApiKey') || ''
  resetDocument()
  metadata.value = JSON.parse(window.localStorage.getItem('metadata') || '')
  prompt.value = window.localStorage.getItem('prompt') || ''
  filename.value = window.localStorage.getItem('filename') || ''
}

function saveState() {
  window.localStorage.setItem('metadata', JSON.stringify(metadata.value))
  window.localStorage.setItem('prompt', prompt.value)
  window.localStorage.setItem('filename', filename.value)
}


function resetDocument() {
  if (!documentContext?.canvas) return
  bounds.value.width = 1024
  bounds.value.height = 1024
  documentContext.clearRect(0, 0, documentContext.canvas.width, documentContext.canvas.height)
  metadata.value = { history: [] }
  prompt.value = ''
  filename.value = ''
  resetFrame()
  drawOverlay()
}


async function scaleDocumentCanvas(by: number) {
  if (bounds.value.width <= 1 && by < 1) return
  if (bounds.value.width >= 5120 && by > 1) return
  const clone = cloneContext(documentContext)
  documentContext.clearRect(0, 0, documentContext.canvas.width, documentContext.canvas.height)
  bounds.value.width = Math.min(5120, bounds.value.width * by)
  bounds.value.height = Math.min(5120, bounds.value.height * by)
  const dx = (bounds.value.width - clone.canvas.width) / 2
  const dy = (bounds.value.width - clone.canvas.width) / 2
  documentContext.drawImage(
    clone.canvas,
    dx,
    dy,
    clone.canvas.width,
    clone.canvas.height)

  const scaleDocumentCanvas_keepFrameSize = false
  if (scaleDocumentCanvas_keepFrameSize) {
    frame.value.x += dx
    frame.value.y += dy
  } else {
    frame.value.width += clone.canvas.width
    frame.value.height += clone.canvas.height
  }

  if (!rectanglesIntersect(frame.value, { x: 0, y: 0, width: bounds.value.width, height: bounds.value.height })) {
    resetFrame()
  }
  drawOverlay()
}

async function autoCrop() {
  const cropped = await autoCropImage(documentContext)
  bounds.value.width = cropped.canvas.width
  bounds.value.height = cropped.canvas.height
  documentContext.drawImage(cropped.canvas, 0, 0)
}


async function galleryItemSelected(item: GalleryItem) {
  const image = await loadGalleryItem(item)

  bounds.value.width = image.width
  bounds.value.height = image.height
  resetFrame()

  documentContext.drawImage(image, 0, 0)
  prompt.value = mostRecentPrompt(item)
  filename.value = item.filename
  metadata.value = clone(item.metadata)
  saveState()
}

async function deleteImage(deleteFilename: string) {
  deleteGalleryItem(deleteFilename)
}

async function saveDocument() {
  const newItem: GalleryItem = {
    dataUrl: documentContext.canvas.toDataURL('image/png'),
    status: 'loading',
    filename: filename.value,
    metadata: metadata.value
  }

  const item = await saveGalleryItem(newItem)

  filename.value = item.filename
  metadata.value = item.metadata
  saveState()
}


async function generateImage() {
  await openAiService.generate({
    prompt: prompt.value,
  })
}

async function variationImage() {
  await openAiService.variation({
    image: createContextFromFrame(1024, 1024),
    metadata: metadata.value
  })
}

async function outpaintImage() {
  const outpaintImage_saveBeforeOutpaint = false
  if (outpaintImage_saveBeforeOutpaint) {
    await compositionService.flatten({
      metadata: metadata.value,
      width: documentContext.canvas.width,
      height: documentContext.canvas.height,
      layers: [
        createLayer(documentContext)
      ]
    })
  }

  const compositionRequired = frame.value.height !== 1024 ||
    frame.value.width !== 1024 ||
    frame.value.width !== bounds.value.width ||
    frame.value.height !== bounds.value.height

  const compositionData = compositionRequired ? {
    documentContext: cloneContext(documentContext),
    frame: clone(frame.value)
  } : null

  const outpaintResult = await openAiService.outpaint({
    prompt: prompt.value,
    image: createContextFromFrame(1024, 1024),
    metadata: metadata.value
  })

  if (compositionData && outpaintResult) {
    await compositionService.flatten({
      metadata: metadata.value,
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


function createContextFromFrame(width: number, height: number) {
  const image = createContext(width, 1024)
  image.drawImage(documentContext.canvas,
    frame.value.x,
    frame.value.y,
    frame.value.width,
    frame.value.height,
    0, 0, width, height,
  )
  return image
}

function growFrame(by: number) {
  // TODO getting stuck at 512 was frustrating for me
  if (frame.value.width <= 512 && by < 1) return
  if (frame.value.width >= 5120 && by > 1) return
  frame.value.x -= by / 2
  frame.value.y -= by / 2
  frame.value.width = frame.value.width + by
  frame.value.height = frame.value.height + by
  drawOverlay()
}

function mouseUp(mouse: MouseEvent) {
  documentMouseUp()
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
