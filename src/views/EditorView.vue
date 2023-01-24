<template>
  <div class="layout" @mouseup="mouseUp">
    <main class="main">
      <Menu></Menu>

      <form class="form-controls">
        <textarea type="text" id="prompt" v-model="prompt"></textarea>
      </form>
      <section class="tool-panel">
        <h3>Document Settings</h3>
        <button type="button" @click="showMetadata = !showMetadata">Toggle Metadata</button>
        <textarea class="metadata" v-model="metadataAsJson" v-if="showMetadata"></textarea>
        <input type="text" v-model="filename" />
        <button type="button" @click="deleteImage(filename)">Delete</button>
        
      </section>
      <section class="tool-panel">
        <h3>App Settings</h3>
        <button type="button" @click="toggleOpenApiKey()">Toggle Key</button>
        <input type="text" v-model="openApiKey" v-if="showOpenApiKey" />
      </section>
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
      <section class="tool-panel">
        <h3>Tool</h3>
        <button type="button" @click="toolSelected = 'pen'" :class="{ 'use-tool': toolSelected === 'pen' }">Pen</button>
        <button type="button" @click="toolSelected = 'drag'"
          :class="{ 'use-tool': toolSelected === 'drag' }">Drag</button>
        <button type="button" @click="toolSelected = 'drag-frame'"
          :class="{ 'use-tool': toolSelected === 'drag-frame' }">Drag frame</button>
      </section>
      <section class="tool-panel" v-if="toolSelected === 'pen'">
        <h3>Pen Settings</h3>
        <label for="penSize">Pen size</label>
        <input type="number" id="penSize" v-model="penSize" step="5" min="0" max="1000" />
      </section>
      <section class="tool-panel" v-if="toolSelected === 'drag' || toolSelected === 'drag-frame'">
        <h3>Drag Settings</h3>
        <label for="snap">snap</label>
        <input type="number" id="snap" v-model="snapSize" step="1" min="1" max="256" />
      </section>
      
      <span class="status-bar">
        <span>canvas:{{ width }}x{{ height }}</span>
        <span>window:{{ frame.width }}x{{ frame.height }}</span>
      </span>
      <div class="document-panel">
        <div class="document" :style="{ 'aspect-ratio': width + ' / ' + height }">

          <canvas id="edit-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
          <canvas id="overlay-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
        </div>
      </div>
    </main>
    <aside class="side-panel">
      <Gallery></Gallery>
    </aside>
  </div>
</template>

<script lang="ts" setup>

import { computed, onMounted, ref, watch, watchSyncEffect } from 'vue';
import type { GalleryItem, GalleryMetadata, Rect, Tools, DragOrigin, GalleryItemDataUrl } from '@/interfaces/EditorView-interfaces';
import { loadImage, clone, getDatestamp, extendMetadata, mostRecentPrompt } from './EditorView-utils';
import { openAiEditImage, openAiGenerateImage, openAiImageVariation } from './EditorView/open-ai';
import { shotgunEffect } from './EditorView/effects';
import { clearCircle, scaleImage } from './EditorView/draw';
import { cloneContext, createContext, autoCropImage, imageCountEmptyPixels } from './EditorView/canvas';

import Menu from '@/components/Menu.vue'
import Gallery from '@/components/Gallery.vue'
import { onApplyEffect, onSelectTool, onAction } from '@/stores/appActions'
import { useKeyboardHandler } from '@/stores/keyboardHandler';
import { deleteGalleryItem, loadGalleryItem, onSelected, saveGalleryItem, updateGalleryItem } from '@/stores/galleryService';


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
const toolSelected = ref<Tools>('drag')
const penSize = ref<number>(300)
const snapSize = ref<number>(128)
const openApiKey = ref<string>('')
//const galleryItems = ref<GalleryItem[]>([])

const documentContext = ref<CanvasRenderingContext2D>({} as CanvasRenderingContext2D)
const overlayContext = ref<CanvasRenderingContext2D>({} as CanvasRenderingContext2D)

const width = ref<number>(1024)
const height = ref<number>(1024)
const dragOrigin = ref<DragOrigin | null>(null)

const frame = ref<Rect>({
  x: 0,
  y: 0,
  width: width.value,
  height: height.value
})

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

watch(onAction, action => {
  if (action.action === 'save') saveDocument()
  if (action.action === 'reset') resetDocument()
  if (action.action === 'auto-crop') autoCrop()
})

watch(onApplyEffect, action => {
  if (action.type === 'shotgun') shotgunEffect(documentContext.value)
})
watch(onSelectTool, action => toolSelected.value = action.tool)

watch(onSelected, action => galleryItemSelected(action.item))

onMounted(async () => {
  await setupDocument()
  await loadState()
})

function loadState() {
  openApiKey.value = window.localStorage.getItem('openApiKey') || ''
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
  width.value = 1024
  height.value = 1024
  documentContext.value.clearRect(0, 0, documentContext.value.canvas.width, documentContext.value.canvas.height)
  metadata.value = { history: [] }
  prompt.value = ''
  filename.value = ''
  resetFrame()
  drawOverlay()
}

function resetFrame() {
  frame.value = {
    x: 0,
    y: 0,
    width: width.value,
    height: height.value,
  }
}

async function scaleDocumentCanvas(by: number) {
  if (width.value <= 1 && by < 1) return
  if (width.value >= 5120 && by > 1) return
  const clone = cloneContext(documentContext.value)
  documentContext.value.clearRect(0, 0, documentContext.value.canvas.width, documentContext.value.canvas.height)
  width.value = Math.min(5120, width.value * by)
  height.value = Math.min(5120, height.value * by)
  const dx = (width.value - clone.canvas.width) / 2
  const dy = (width.value - clone.canvas.width) / 2
  documentContext.value.drawImage(
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

  if (!rectanglesIntersect(frame.value, { x: 0, y: 0, width: width.value, height: height.value })) {
    resetFrame()
  }
  drawOverlay()
}

function rectanglesIntersect(a: Rect, b: Rect) {
  const isLeft = a.x + a.width < b.x
  const isRight = a.x > b.x + b.width
  const isAbove = a.y > b.y + b.height
  const isBelow = a.y + a.height < b.y
  return !(isLeft || isRight || isAbove || isBelow)
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



async function galleryItemSelected(item: GalleryItem) {
  const image = await loadGalleryItem(item)

  width.value = image.width
  height.value = image.height
  resetFrame()

  documentContext.value.drawImage(image, 0, 0)
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
    dataUrl: documentContext.value.canvas.toDataURL('image/png'),
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
  const filename = `image-0-${getDatestamp()}.png`
  const item: GalleryItem = {
    filename,
    status: 'loading',
    metadata: {
      history: [{
        method: 'generation',
        filename,
        prompt: prompt.value,
        version: 'OpenAI'
      }]
    }
  }

  // TODO not sure if I want this method to be exposed?
  updateGalleryItem(item)
  const generatedImage = await openAiGenerateImage(item, openApiKey.value)
  if (generatedImage.status === 'error') {
    updateGalleryItem(generatedImage)
  } else {
    const updatedItem = await saveGalleryItem(generatedImage)
    updateGalleryItem(updatedItem)
  }
}

async function outpaintImage() {
  if (!prompt.value.trim()) {
    alert('no prompt!')
    return
  }

  const filename = `image-0-${getDatestamp()}.png`
  const compositionRequired = () => frame.value.height !== 1024 ||
    frame.value.width !== 1024 ||
    frame.value.width !== width.value ||
    frame.value.height !== height.value

  const compositionData = compositionRequired() ?
    {
      filename: `image-1-${getDatestamp()}.png`,
      wholeCanvasClone: cloneContext(documentContext.value),
      frame: clone(frame.value)
    } : null

  const windowClone = cloneContext(documentContext.value, frame.value.x, frame.value.y, frame.value.width, frame.value.height)

  const scaledWindow = createContext(1024, 1024)
  scaledWindow.drawImage(windowClone.canvas, 0, 0, 1024, 1024)
  if (await imageCountEmptyPixels(scaledWindow) === 0) {
    alert('no empty pixels!')
    return
  }

  const image = (await new Promise<Blob | null>(resolve => scaledWindow.canvas.toBlob(resolve)))!

  const item: GalleryItem = {
    filename,
    status: 'loading',
    metadata: extendMetadata(metadata.value, {
      method: 'edit',
      prompt: prompt.value,
      image, // TODO  this get doesn't get saved into files as metadata only because clone doesn't work right
      mask: image, // TODO does this get saved into files as metadata!
      filename,
      version: 'OpenAI'
    })
  }

  updateGalleryItem(item)
  const generatedImage = await openAiEditImage(item, openApiKey.value)
  if (generatedImage.status === 'error') {
    updateGalleryItem(generatedImage)
  } else {

    const updatedItem = await saveGalleryItem(generatedImage)
    updateGalleryItem(updatedItem)

    if (compositionData) {
      const finalContext = createContext(compositionData.wholeCanvasClone.canvas.width, compositionData.wholeCanvasClone.canvas.height)
      finalContext.drawImage(await loadImage(generatedImage.dataUrl), compositionData.frame.x, compositionData.frame.y, compositionData.frame.width, compositionData.frame.height)
      finalContext.drawImage(compositionData.wholeCanvasClone.canvas, 0, 0, compositionData.wholeCanvasClone.canvas.width, compositionData.wholeCanvasClone.canvas.height)

      const finalItem = clone(item) as GalleryItemDataUrl
      finalItem.status = 'saved'
      finalItem.dataUrl = finalContext.canvas.toDataURL()
      finalItem.filename = compositionData.filename
      await saveGalleryItem(finalItem)
      updateGalleryItem(finalItem)
    }

    // TODO, if the image selected we can update the canvas immediatly
  }
}

async function variationImage() {
  const filename = `image-0-${getDatestamp()}.png`
  const image = (await new Promise<Blob | null>(resolve => documentContext.value.canvas.toBlob(resolve)))!
  const item: GalleryItem = {
    filename,
    status: 'loading',
    metadata: extendMetadata(metadata.value, {
      method: 'variation',
      image, // TODO does this get saved into files as metadata!
      filename,
      version: 'OpenAI'
    })
  }
  updateGalleryItem(item)
  const generatedImage = await openAiImageVariation(item, openApiKey.value)
  if (generatedImage.status === 'error') {
    updateGalleryItem(generatedImage)
  } else {
    const updatedItem = await saveGalleryItem(generatedImage)
    updateGalleryItem(updatedItem)
  }
}

async function growFrame(by: number) {
  if (frame.value.width <= 512 && by < 1) return
  if (frame.value.width >= 5120 && by > 1) return
  frame.value.x -= by / 2
  frame.value.y -= by / 2
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

.tool-panel {
  margin: 0.4em;
}

.tool-panel h3 {
  display: none;
}
</style>
