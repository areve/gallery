<template>
  <div class="layout" @mouseup="mouseUp">
    <main class="main">
      <nav class="menu">
        <ul class="menu-list">
          <li class="menu-item">File</li>
          <li class="menu-item">Edit</li>
          <li class="menu-item">About</li>
        </ul>
      </nav>
      <form class="form-controls">
        <label for="prompt">Prompt</label>
        <textarea type="text" id="prompt" v-model="prompt"></textarea>
        <textarea class="metadata" v-model="metadataAsJson" v-if="showMetadata"></textarea>
        <button type="button" @click="generateImage()">Generate</button>
        <button type="reset" @click="resetDocument()">Reset</button>
        <button type="button" @click="variationImage()">Variation</button>
        <button type="button" @click="outpaintImage()">Outpaint</button>
        <button type="button" @click="scaleImage(documentContext, scaleImageBy)">Scale image</button>
        <label for="scaleBy">by</label>
        <input type="number" id="scaleBy" v-model="scaleImageBy" step="0.00001" min="0" />
        <button type="button" @click="deleteGalleryItem(filename)">Delete</button>
        <input type="text" v-model="filename" />
        <button type="button" @click="showMetadata = !showMetadata">Toggle Metadata</button>
        <button type="button" @click="saveDocument()">Save</button>
        <button type="button" @click="toggleOpenApiKey()">Toggle Key</button>
        <input type="text" v-model="openApiKey" v-if="showOpenApiKey" />
        <button type="button" @click="toolSelected = 'pen'" :class="{ 'use-tool': toolSelected === 'pen' }">Pen</button>
        <button type="button" @click="toolSelected = 'drag'"
          :class="{ 'use-tool': toolSelected === 'drag' }">Drag</button>
        <button type="button" @click="toolSelected = 'drag-frame'"
          :class="{ 'use-tool': toolSelected === 'drag-frame' }">Drag frame</button>
        <label for="penSize">size</label>
        <input type="number" id="penSize" v-model="penSize" step="5" min="0" max="1000" />
        <label for="snap">snap</label>
        <input type="number" id="snap" v-model="snapSize" step="1" min="1" max="256" />
        <button type="button" @click="shotgunEffect(documentContext)">Shotgun effect</button>

        <button type="button" @click="scaleDocumentCanvas(0.5)">Shrink</button>
        <button type="button" @click="scaleDocumentCanvas(2)">Grow</button>
        <button type="button" @click="growFrame(-512)">Shrink frame</button>
        <button type="button" @click="growFrame(512)">Grow frame</button>
        <button type="button" @click="autoCrop(); saveDocument()">Auto crop</button>
        <span>canvas:{{ width }}x{{ height }}</span>
        <span>window:{{ frame.width }}x{{ frame.height }}</span>
      </form>
      <div class="document-panel">
        <div class="document" :style="{ 'aspect-ratio': width + ' / ' + height }">

          <canvas id="edit-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
          <canvas id="overlay-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
        </div>
      </div>
    </main>
    <aside class="side-panel">
      <ul class="gallery">
        <li v-for="item in galleryItems" class="gallery-item">
          <button v-if="item.status === 'loading'" type="button" class="loading-button">{{ findPrompt(item) }}<div
              class="spinner"></div></button>
          <button v-else-if="item.status === 'error'" type="button" class="error-button">{{ findError(item) }}</button>
          <button v-else type="button" @click="loadGalleryItem(item)" class="gallery-button"><img
              :src="item.dataUrl || '/downloads/' + item.filename" /></button>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script lang="ts" setup>

import { computed, onMounted, ref, watchSyncEffect } from 'vue';
import type { GalleryItem, GalleryMetadata, Rect, Tools, DragOrigin, HistoryItem, HistoryItemEdit, HistoryItemGeneration } from './EditorView-interfaces';
import { loadImage, clone, getDatestamp, extendMetadata, getReverseHistory } from './EditorView-utils';
import { openAiEditImage, openAiGenerateImage, openAiImageVariation } from './EditorView/open-ai';
import { shotgunEffect } from './EditorView/effects';
import { clearCircle, scaleImage } from './EditorView/draw';
import { cloneContext, createContext, autoCropImage } from './EditorView/canvas';
import { deleteGaleryItem, getGallery, getGalleryItem, saveGalleryItem } from './EditorView/gallery';

const prompt = ref<string>('')
const showMetadata = ref<boolean>(false)
const scaleImageBy = ref<number>(0.5)
const filename = ref<string>('')
const metadata = ref<GalleryMetadata>({ history: [] })

const metadataAsJson = computed({
  get: () => {
    return JSON.stringify(metadata.value)
  },
  set: (value: string) => {
    throw ('unimplemented yet')
    return JSON.parse(value)
  }
})
const showOpenApiKey = ref<boolean>(false)
const toolSelected = ref<Tools>('pen')
const penSize = ref<number>(100)
const snapSize = ref<number>(128)
const openApiKey = ref<string>('')
const galleryItems = ref<GalleryItem[]>([])

const documentContext = ref<CanvasRenderingContext2D>({} as CanvasRenderingContext2D)
const overlayContext = ref<CanvasRenderingContext2D>({} as CanvasRenderingContext2D)

const width = ref<number>(1024)
const height = ref<number>(1024)
const dragOrigin = ref<DragOrigin | null>(null)


function toggleOpenApiKey() {
  showOpenApiKey.value = !showOpenApiKey.value
  if (!showOpenApiKey.value) {
    window.localStorage.setItem('openApiKey', openApiKey.value)
  }
}

watchSyncEffect(() => {
  if (!documentContext.value.canvas) return
  if (!overlayContext.value.canvas) return
  documentContext.value.canvas.height = height.value
  documentContext.value.canvas.width = width.value
  overlayContext.value.canvas.height = height.value
  overlayContext.value.canvas.width = width.value
})

watchSyncEffect(() => {
  if (!documentContext.value.canvas) return
  if (!overlayContext.value.canvas) return
  void (frame.value)
  drawOverlay()
})

const frame = ref<Rect>({
  x: 0,
  y: 0,
  width: width.value,
  height: height.value
})

onMounted(async () => {
  await setupDocument()
  await loadState()
  await loadGallery()
})

function loadState() {
  openApiKey.value = window.localStorage.getItem('openApiKey') || ''
  width.value = 1024
  height.value = 1024
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

async function setupDocument() {
  const canvas = document.getElementById("edit-canvas") as HTMLCanvasElement
  documentContext.value = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
  const overlayCanvas = document.getElementById("overlay-canvas") as HTMLCanvasElement
  overlayContext.value = overlayCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
}

function resetDocument() {
  // this.canvas.width = this.width
  // this.canvas.height = this.height
  // this.overlayCanvas.width = this.width
  // this.overlayCanvas.height = this.height
  clearDocumentCanvas()
  metadata.value = { history: [] }
  prompt.value = ''
  filename.value = ''
  drawOverlay()
}

function clearDocumentCanvas() {
  documentContext.value.clearRect(0, 0, documentContext.value.canvas.width, documentContext.value.canvas.height)
}


async function scaleDocumentCanvas(by: number) {
  if (width.value <= 1 && by < 1) return
  if (width.value >= 5120 && by > 1) return
  const clone = cloneContext(documentContext.value)
  clearDocumentCanvas()
  width.value = Math.min(5120, width.value * by)
  height.value = Math.min(5120, height.value * by)
  // overlayCanvas.value.width = width.value
  // overlayCanvas.value.height = height.value
  documentContext.value.drawImage(
    clone.canvas,
    (width.value - clone.canvas.width) / 2,
    (height.value - clone.canvas.height) / 2,
    clone.canvas.width,
    clone.canvas.height)
  drawOverlay()
}

async function autoCrop() {
  const cropped = await autoCropImage(documentContext.value)
  width.value = cropped.canvas.width
  height.value = cropped.canvas.height
  documentContext.value.drawImage(cropped.canvas, 0, 0)
}

function drawOverlay() {
  overlayContext.value.clearRect(0, 0, width.value, height.value)
  overlayContext.value.fillStyle = '#77777777'
  overlayContext.value.fillRect(0, 0, width.value, height.value)
  overlayContext.value.clearRect(frame.value.x, frame.value.y, frame.value.width, frame.value.height)
}

async function loadGallery() {
  galleryItems.value = await getGallery()
}

async function loadGalleryItem(item: GalleryItem) {
  const image = await getGalleryItem(item.filename)

  width.value = image.width
  height.value = image.height

  documentContext.value.drawImage(image, 0, 0)
  const history = getReverseHistory(item)

  // TODO ugly code
  prompt.value = history.filter(item => item?.prompt)[0]?.prompt || ''
  filename.value = item.filename
  metadata.value = clone(item.metadata)
  saveState()
}

async function deleteGalleryItem(deleteFilename: string) {
  await deleteGaleryItem(deleteFilename)
  filename.value = ''
  metadata.value = { history: [] }
  clearDocumentCanvas()
  saveState()

  // TODO loadGallery is inefficient here
  await loadGallery()
}

async function saveDocument() {
  const item = await saveGalleryItem({
    dataUrl: documentContext.value.canvas.toDataURL('image/png'),
    status: 'loading',
    filename: filename.value,
    metadata: metadata.value
  })

  filename.value = item.filename
  metadata.value = item.metadata || {}
  saveState()

  // TODO loadGallery inefficient here
  await loadGallery()
}

function findPrompt(item: GalleryItem) {
  const history = getReverseHistory(item)
  // TODO yuk function
  const prompt = (history.filter((item: any) => item?.prompt)[0] as any).prompt || ''

  return prompt
}

function findError(item: GalleryItem) {
  const history = getReverseHistory(item)
  // TODO yuk function
  const error = history.filter((item: any) => item?.error)[0]?.error || ''
  return error
}

function replaceInGallery(updatedItem: GalleryItem) {
  galleryItems.value = galleryItems.value.map(item => item.filename === updatedItem.filename ? updatedItem : item)
}

async function generateImage() {
  const filename = `image-0-${getDatestamp()}.png`
  const item: GalleryItem = {
    filename,
    status: 'loading',
    metadata: {
      history: [{
        method: 'createImage',
        filename,
        prompt: prompt.value,
        version: 'OpenAI'
      }]
    }
  }

  galleryItems.value = [item, ...galleryItems.value]
  const generatedImage = await openAiGenerateImage(item, openApiKey.value)
  const updatedItem = await saveGalleryItem(generatedImage)
  replaceInGallery(updatedItem)
}


async function outpaintImage() {
  if (!prompt.value.trim()) {
    alert('no prompt!')
    return
  }

  const filename = `image-0-${getDatestamp()}.png`

  const wholeCanvasClone = cloneContext(documentContext.value)
  const windowClone = cloneContext(documentContext.value, frame.value.x, frame.value.y, frame.value.width, frame.value.height)

  const scaledWindow = createContext(1024, 1024)
  scaledWindow.drawImage(windowClone.canvas, 0, 0, 1024, 1024)

  const image = (await new Promise<Blob | null>(resolve => scaledWindow.canvas.toBlob(resolve)))!
  const mask = (await new Promise<Blob | null>(resolve => scaledWindow.canvas.toBlob(resolve)))!

  // TODO validate that mask has pixels
  const item: GalleryItem = {
    filename,
    status: 'loading',
    metadata: extendMetadata(metadata.value, {
      method: 'createImageEdit',
      prompt: prompt.value,
      image,
      mask,
      filename,
      version: 'OpenAI'
    })
  }

  galleryItems.value = [item, ...galleryItems.value]
  const generatedImage = await openAiEditImage(item, openApiKey.value)
  documentContext.value.drawImage(await loadImage(generatedImage.dataUrl), frame.value.x, frame.value.y, frame.value.width, frame.value.height)
  documentContext.value.drawImage(wholeCanvasClone.canvas, 0, 0, wholeCanvasClone.canvas.width, wholeCanvasClone.canvas.height)
  const updatedItem = await saveGalleryItem(generatedImage)
  replaceInGallery(updatedItem)
}

async function variationImage() {
  const filename = `image-0-${getDatestamp()}.png`
  const image = (await new Promise<Blob | null>(resolve => documentContext.value.canvas.toBlob(resolve)))!
  const item: GalleryItem = {
    filename,
    status: 'loading',
    metadata: extendMetadata(metadata.value, {
      method: 'createImageVariation',
      image,
      filename,
      version: 'OpenAI'
    })
  }
  galleryItems.value = [item, ...galleryItems.value]
  const generatedImage = await openAiImageVariation(item, openApiKey.value)
  const updatedItem = await saveGalleryItem(generatedImage)
  replaceInGallery(updatedItem)
}

async function growFrame(by: number) {
  if (frame.value.width <= 512 && by < 1) return
  if (frame.value.width >= 5120 && by > 1) return
  frame.value.width = frame.value.width + by
  frame.value.height = frame.value.height + by
  drawOverlay()
}

function mouseUp(mouse: MouseEvent) {
  dragOrigin.value = null
}

function mouseDown(mouse: MouseEvent) {
  dragOrigin.value = {
    x: mouse.offsetX,
    y: mouse.offsetY,
    data: documentContext.value.getImageData(0, 0, width.value, height.value),
    frame: { ...frame.value }
  }
}



function mouseMove(mouse: MouseEvent) {
  if (!dragOrigin.value) return

  const dx = (mouse.offsetX - dragOrigin.value.x) / documentContext.value.canvas.offsetWidth * documentContext.value.canvas.width
  const dy = (mouse.offsetY - dragOrigin.value.y) / documentContext.value.canvas.offsetHeight * documentContext.value.canvas.height
  const snapDx = Math.floor(dx / snapSize.value) * snapSize.value
  const snapDy = Math.floor(dy / snapSize.value) * snapSize.value

  if (toolSelected.value === 'pen') {
    const ctx = documentContext.value
    const x = mouse.offsetX / documentContext.value.canvas.offsetWidth * documentContext.value.canvas.width
    const y = mouse.offsetY / documentContext.value.canvas.offsetHeight * documentContext.value.canvas.height
    clearCircle(documentContext.value, x, y, penSize.value / 2)

  } else if (toolSelected.value === 'drag') {
    documentContext.value.clearRect(0, 0, width.value, height.value)
    documentContext.value.putImageData(dragOrigin.value.data, snapDx, snapDy)
  } else if (toolSelected.value === 'drag-frame') {
    frame.value.x = dragOrigin.value.frame.x + snapDx
    frame.value.y = dragOrigin.value.frame.y + snapDy
  }
}
</script>

<style scoped>
@import './EditorView.css';
</style>
