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
        <textarea class="metadata" v-model="metadataField" v-if="showMetadata"></textarea>
        <button type="button" @click="createServerless()">Create</button>
        <button type="reset" @click="reset()">Reset</button>
        <button type="button" @click="createVariationServerless()">Variation</button>
        <button type="button" @click="createEditServerless()">Fill</button>
        <button type="button" @click="scale()">Scale</button>
        <label for="scaleBy">by</label>
        <input type="number" id="scaleBy" v-model="scaleBy" step="0.00001" min="0" />
        <button type="button" @click="deleteImage()">Delete</button>
        <input type="text" v-model="filename" />
        <button type="button" @click="showMetadata = !showMetadata">Toggle Metadata</button>
        <button type="button" @click="saveDocument()">Save</button>
        <button type="button" @click="toggleKey()">Show Key</button>
        <input type="text" v-model="openApiKey" v-if="showOpenApiKey" />
        <button type="button" @click="toolSelected = 'pen'" :class="{ 'use-tool': toolSelected === 'pen' }">Pen</button>
        <button type="button" @click="toolSelected = 'drag'"
          :class="{ 'use-tool': toolSelected === 'drag' }">Drag</button>
        <button type="button" @click="toolSelected = 'outfill'"
          :class="{ 'use-tool': toolSelected === 'outfill' }">Outfill</button>
        <label for="penSize">size</label>
        <input type="number" id="penSize" v-model="penSize" step="5" min="0" max="1000" />
        <label for="snap">snap</label>
        <input type="number" id="snap" v-model="snapSize" step="1" min="1" max="256" />
        <button type="button" @click="pepper">Pepper</button>
        <button type="button" @click="shrinkToCorner">Shrink to corner</button>
        <button type="button" @click="grow(0.5)">Shrink</button>
        <button type="button" @click="grow(2)">Grow</button>
        <button type="button" @click="growWindow(-512)">Shrink window</button>
        <button type="button" @click="growWindow(512)">Grow window</button>
        <button type="button" @click="autoCrop()">Auto crop</button>
        <span>canvas:{{ width }}x{{ height }}</span>
        <span>window:{{ window.width }}x{{ window.height }}</span>
      </form>
      <div class="document-panel">
        <div class="document" :style="{ 'aspect-ratio': width + ' / ' + height }">
          <div class="spinner" v-if="loading"></div>
          <canvas id="edit-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
          <canvas id="overlay-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
        </div>
      </div>
    </main>
    <aside class="side-panel">
      <ul class="gallery">
        <li v-for="item in list" class="gallery-item">

          <button v-if="item.status === 'loading'" type="button" class="loading-button">{{ item.text }}<div
              class="spinner"></div></button>
          <button v-else-if="item.status === 'error'" type="button" class="error-button">{{ item.text }}</button>
          <button v-else type="button" @click="selectImage('/downloads/' + item.filename, item)"
            class="gallery-button"><img :src="item.dataUrl || '/downloads/' + item.filename" /></button>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import FormData from 'form-data';

interface Metadata {
  history: HistoryItem[]
}

interface HistoryItem {
  method: 'createImage' | 'createImageEdit' | 'createImageVariation'
  prompt?: string
  filename: string
  version: 'OpenAI'
  created?: string;
}

interface GalleryItem {
  filename: string,
  status: 'error' | 'loading' | 'ready',
  text: string
  metadata?: Metadata
  dataUrl?: string
}

export default defineComponent({
  name: "editor",
  components: {},
  data() {
    return {
      imageSrc: '',
      filename: '',
      prompt: '',
      queue: [] as GalleryItem[],
      serverList: [] as GalleryItem[],
      showMetadata: false,
      metadataField: '{}',
      metadataAsJson: '',
      scaleBy: 0.5,
      penIsDown: false,
      penSize: 50,
      snapSize: 128,
      toolSelected: 'outfill',
      dragOutfillData: null as null | {
        x: number,
        y: number
        window: {
          x: number,
          y: number
        }
      },
      window: {
        x: 0,
        y: 0,
        width: 1024,
        height: 1024
      },
      dragData: null as null | {
        x: number,
        y: number,
        data: ImageData
      },
      openApiKey: '',
      showOpenApiKey: false,
      loading: false,
      width: 1024,
      height: 1024,
    };
  },
  mounted() {
    this.loadState()
    this.getList()
  },
  computed: {
    canvas() {
      return document.getElementById(
        "edit-canvas"
      ) as HTMLCanvasElement
    },
    overlayCanvas() {
      return document.getElementById(
        "overlay-canvas"
      ) as HTMLCanvasElement
    },
    context(): CanvasRenderingContext2D {
      return this.canvas.getContext('2d')!
    },
    overlayContext(): CanvasRenderingContext2D {
      return this.overlayCanvas.getContext('2d')!
    },
    baseUrl: function () {
      return this.openApiKey ? 'https://api.openai.com/v1' : '/api/openai'
    },
    metadata: {
      get() {
        let result
        try {
          result = JSON.parse(this.metadataField)
        } catch (e) {
          alert('cannot parse metadata' + this.metadataField)
          throw 'cannot parse metadata'
        }
        return result || {}
      },
      set(value: any) {

        const normalizedValue = value || {}
        this.metadataAsJson = JSON.stringify(normalizedValue, null, '  ')
        this.metadataField = JSON.stringify(normalizedValue, null, '  ')
      }
    },
    list: function () {
      return this.queue.concat(this.serverList)
    }
  },
  methods: {
    pepper() {
      const canvas = this.canvas
      const ctx = this.context

      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        ctx.beginPath();

        const radius = 8
        ctx.arc(x, y, radius / 2, 0, 2 * Math.PI, false);
        ctx.save();
        ctx.clip();
        ctx.clearRect(x - radius / 2, y - radius / 2, radius, radius)
        ctx.restore();
      }

    },
    mouseUp(mouse: MouseEvent) {
      if (this.toolSelected === 'pen') {
        this.penIsDown = false
      } else if (this.toolSelected === 'drag') {
        this.dragData = null
      } else if (this.toolSelected === 'outfill') {
        this.dragOutfillData = null
      }
    },
    mouseDown(mouse: MouseEvent) {
      if (this.toolSelected === 'pen') {
        this.penIsDown = true
        this.mouseMove(mouse)
      } else if (this.toolSelected === 'drag') {
        const canvas = this.canvas
        const ctx = this.context
        this.dragData = {
          x: mouse.offsetX,
          y: mouse.offsetY,
          data: this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
        }
      } else if (this.toolSelected === 'outfill') {
        this.dragOutfillData = {
          x: mouse.offsetX,
          y: mouse.offsetY,
          window: { ...this.window },
        }
      }
    },
    mouseMove(mouse: MouseEvent) {
      this.drawOverlay()

      if (this.toolSelected === 'pen') {
        if (!this.penIsDown) return;
        const ctx = this.context
        const canvas = this.canvas
        const x = mouse.offsetX / this.canvas.offsetWidth * canvas.width
        const y = mouse.offsetY / this.canvas.offsetHeight * canvas.height
        ctx.beginPath();
        ctx.arc(x, y, this.penSize / 2, 0, 2 * Math.PI, false);
        ctx.save();
        ctx.clip();
        ctx.clearRect(x - this.penSize / 2, y - this.penSize / 2, this.penSize, this.penSize)
        ctx.restore();
      } else if (this.toolSelected === 'drag') {
        if (!this.dragData) return
        const ctx = this.context
        const canvas = this.canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const dx = (mouse.offsetX - this.dragData.x) / this.canvas.offsetWidth * canvas.width
        const dy = (mouse.offsetY - this.dragData.y) / this.canvas.offsetHeight * canvas.height
        const snapDx = Math.floor(dx / this.snapSize) * this.snapSize
        const snapDy = Math.floor(dy / this.snapSize) * this.snapSize
        ctx.putImageData(this.dragData.data, snapDx, snapDy)
      } else if (this.toolSelected === 'outfill') {
        if (!this.dragOutfillData) return
        const dx = (mouse.offsetX - this.dragOutfillData.x) / this.canvas.offsetWidth * this.width
        const dy = (mouse.offsetY - this.dragOutfillData.y) / this.canvas.offsetHeight * this.height
        const snapDx = Math.floor(dx / this.snapSize) * this.snapSize
        const snapDy = Math.floor(dy / this.snapSize) * this.snapSize
        this.drawOverlay()
        this.window.x = this.dragOutfillData.window.x + snapDx
        this.window.y = this.dragOutfillData.window.y + snapDy
      }
    },
    drawOverlay() {
      this.overlayContext.clearRect(0, 0, this.width, this.height)
      this.overlayContext.fillStyle = '#77777777'
      this.overlayContext.fillRect(0, 0, this.width, this.height)
      this.overlayContext.clearRect(this.window.x, this.window.y, this.window.width, this.window.height)
    
    },
    toggleKey() {
      this.showOpenApiKey = !this.showOpenApiKey
      window.localStorage.setItem('openApiKey', this.openApiKey)
    },
    clearCanvas() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },
    reset() {
      this.canvas.width = this.width
      this.canvas.height = this.height
      this.overlayCanvas.width = this.width
      this.overlayCanvas.height = this.height
      this.clearCanvas()
      this.metadata = {}
      this.prompt = ''
      this.filename = ''
      this.drawOverlay()
    },
    saveState() {
      window.localStorage.setItem('image', '')
      window.localStorage.setItem('metadata', this.metadataAsJson)
      window.localStorage.setItem('prompt', this.prompt)
      window.localStorage.setItem('filename', this.filename)
    },
    async loadState() {
      this.openApiKey = window.localStorage.getItem('openApiKey') || ''
      this.width = 1024
      this.height = 1024
      this.reset()
      const dataUrl = window.localStorage.getItem('image')
      if (dataUrl) this.context.drawImage(await loadImage(dataUrl), 0, 0)
      this.metadata = JSON.parse(window.localStorage.getItem('metadata') || '')
      this.prompt = window.localStorage.getItem('prompt') || ''
      this.filename = window.localStorage.getItem('filename') || ''

    },
    async selectImage(url: string, item: any) {
      const image = await loadImage(url)
      this.width = image.width
      this.height = image.height
      this.reset()

      this.context.drawImage(image, 0, 0)
      const history = (Array.isArray(item.metadata.history) ? [...item.metadata.history] : [item.metadata.history]).reverse()
      this.prompt = history.filter((i: any) => i?.prompt)[0]?.prompt || ''
      this.filename = item.filename
      this.metadata = item.metadata
      this.saveState()
    },
    async autoCrop() {

      const width = this.width
      const height = this.height
      const imageData = this.context.getImageData(0, 0, width, height)
  
      const pix = imageData.data;

      let minX = width
      let maxX = 0
      let minY = height
      let maxY = 0
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const a = pix[(y * width + x) * 4 + 0]
          if (a > 0) {
            minX = Math.min(minX, x)
            minY = Math.min(minY, y)
            maxX = Math.max(maxX, x)
            maxY = Math.max(maxY, y)
          }
        }
      }

      const clone = cloneCanvas(this.canvas, minX, minY, maxX + 1 - minX, maxY + 1 - minY)
      this.canvas.width = clone.width
      this.canvas.height = clone.height
      this.width = clone.width
      this.height = clone.height
      this.context.drawImage(clone, 0, 0)
      await this.saveDocument()
    },
    async growWindow(by: number) {
      if (this.window.width <= 512 && by < 1) return
      if (this.window.width >= 5120 && by > 1) return
      this.window.width = this.window.width + by
      this.window.height = this.window.height + by
      this.drawOverlay()
    },
    async grow(by: number) {
      if (this.width <= 1 && by < 1) return
      if (this.width >= 5120 && by > 1) return
      const clone = cloneCanvas(this.canvas)
      this.clearCanvas()
      this.width = Math.min(5120, this.width * by)
      this.height = Math.min(5120, this.height * by)
      this.canvas.width = this.width
      this.canvas.height = this.height
      this.overlayCanvas.width = this.width
      this.overlayCanvas.height = this.height
      this.context.drawImage(
        clone,
        (this.width - clone.width) / 2,
        (this.height - clone.height) / 2,
        clone.width,
        clone.height)
      this.drawOverlay()
    },
    async shrinkToCorner() {
      const clone = cloneCanvas(this.canvas)
      this.clearCanvas()
      this.context.drawImage(
        clone,
        0,
        0,
        clone.width * 0.5,
        clone.height * 0.5)
    },
    async scale() {
      const clone = cloneCanvas(this.canvas)
      this.clearCanvas()
      this.context.drawImage(
        clone,
        (this.canvas.width - clone.width * this.scaleBy) / 2,
        (this.canvas.height - clone.height * this.scaleBy) / 2,
        clone.width * this.scaleBy,
        clone.height * this.scaleBy)
    },
    async deleteImage() {
      this.loading = true
      const response = await axios.post('/api/editor/deleteImage', {
        filename: this.filename
      })

      this.loading = false
      this.filename = ''
      this.metadata = {}
      this.clearCanvas()
      this.saveState()
      this.getList()
    },
    async createEditServerless() {
      const prompt = this.prompt
      if (!prompt.trim()) {
        alert('no prompt!')
        return
      }
      const filename = `image-0-${getDatestamp()}.png`
      const historyItem: HistoryItem = {
        method: 'createImageEdit',
        prompt,
        filename,
        version: 'OpenAI'
      }

      const item: GalleryItem = {
        filename,
        text: prompt,
        status: 'loading',
        metadata: extendMetadata(this.metadata, historyItem)
      }

      this.queue.unshift(item)

      const wholeCanvasClone = cloneCanvas(this.canvas)
      const windowClone = cloneCanvas(this.canvas, this.window.x, this.window.y, this.window.width, this.window.height)
      const scaledWindow = createCanvas(1024, 1024)
      scaledWindow.getContext('2d')!.drawImage(windowClone, 0, 0, 1024, 1024)

      const image = await new Promise<Blob | null>(resolve => scaledWindow.toBlob(resolve))
      const mask = await new Promise<Blob | null>(resolve => scaledWindow.toBlob(resolve))

      const formData = new FormData();
      formData.append('image', image)
      formData.append('mask', mask)
      formData.append('prompt', prompt)
      formData.append('n', 1)
      formData.append('size', "1024x1024")
      formData.append('response_format', "b64_json")

      let response
      try {
        response = await axios.post(
          `${this.baseUrl}/images/edits`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${this.openApiKey}`
            }
          })
      } catch (e) {
        item.status = 'error'
        item.text = findErrorMessage(e)
        this.queue = [...this.queue]
        return
      }

      item.dataUrl = `data:image/png;base64,${response.data.data[0].b64_json}`
      historyItem.created = epochToDate(response.data.created).toISOString()
      await this.saveImage(item)

      this.context.drawImage(await loadImage(item.dataUrl), this.window.x, this.window.y, this.window.width, this.window.height)
      this.context.drawImage(wholeCanvasClone, 0, 0, wholeCanvasClone.width, wholeCanvasClone.height)
    },
    async createVariationServerless() {
      const prompt = this.prompt
      const filename = `image-0-${getDatestamp()}.png`
      const historyItem: HistoryItem = {
        method: 'createImageVariation',
        filename,
        version: 'OpenAI'
      }
      const item: GalleryItem = {
        filename,
        text: `variation on: ${prompt}`,
        status: 'loading',
        metadata: extendMetadata(this.metadata, historyItem)
      }

      this.queue.unshift(item)

      const image = await new Promise<Blob | null>(resolve => this.canvas.toBlob(resolve))

      const formData = new FormData();
      formData.append('image', image)
      formData.append('n', 1)
      formData.append('size', "1024x1024")
      formData.append('response_format', "b64_json")

      let response
      try {
        response = await axios.post(
          `${this.baseUrl}/images/variations`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${this.openApiKey}`
            }
          })
      } catch (e) {
        item.status = 'error'
        item.text = findErrorMessage(e)
        this.queue = [...this.queue]
        return
      }

      item.dataUrl = `data:image/png;base64,${response.data.data[0].b64_json}`
      historyItem.created = epochToDate(response.data.created).toISOString()
      await this.saveImage(item)
    },

    async createServerless() {
      const prompt = this.prompt
      const filename = `image-0-${getDatestamp()}.png`
      const historyItem: HistoryItem = {
        method: 'createImage',
        filename,
        prompt,
        version: 'OpenAI'
      }
      const item: GalleryItem = {
        filename,
        text: prompt,
        status: 'loading',
        metadata: {
          history: [historyItem]
        }
      }

      this.queue.unshift(item)

      let response
      try {
        response = await axios.post(
          `${this.baseUrl}/images/generations`,
          {
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
            "response_format": "b64_json"
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.openApiKey}`
            },
          })
      } catch (e) {
        item.status = 'error'
        item.text = findErrorMessage(e)
        this.queue = [...this.queue]
        return
      }

      item.dataUrl = `data:image/png;base64,${response.data.data[0].b64_json}`
      historyItem.created = epochToDate(response.data.created).toISOString()
      await this.saveImage(item)
    },

    async saveImage(item: GalleryItem) {
      // TODO try catch
      const response = await axios.post('/api/editor/saveImage', {
        image: item.dataUrl,
        filename: item.filename,
        metadata: item.metadata
      })
      item.status = "ready"
      this.queue = this.queue.filter(x => x.filename !== item.filename)
      this.serverList.unshift(item)
    },

    async saveDocument() {
      this.loading = true
      const image = this.canvas.toDataURL('image/png')
      const response = await axios.post('/api/editor/saveImage', {
        image,
        filename: this.filename,
        metadata: this.metadata
      })

      this.filename = response.data[0].filename
      this.metadata = response.data[0].metadata || {}

      this.loading = false
      this.saveState()
      this.getList()
    },
    async getList() {
      const response = await axios.get('/api/gallery/')
      this.serverList = response.data
    },
  },
})

function extendMetadata(metadata: Metadata, historyItem: HistoryItem) {
  const result = JSON.parse(JSON.stringify(metadata))
  result.history = Array.isArray(result.history) ? result.history : [result.history]
  result.history.push(historyItem)
  return result
}

function findErrorMessage(error: any) {
  const result = error?.response?.data?.error?.message ||
    error?.message
  if (!result) {
    console.error(error)
  }
  return result || 'Unknown Error'
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    const tempImage = new Image()
    tempImage.onload = () => {
      resolve(tempImage)
    }
    tempImage.src = dataUrl
  })
}

function createCanvas(width: number, height: number) {
  const result = document.createElement('canvas')
  result.width = width
  result.height = height
  return result
}

function cloneCanvas(canvas: HTMLCanvasElement, x: number = 0, y: number = 0, w: number = 0, h: number = 0) {
  const width = w === 0 ? canvas.width : w
  const height = h === 0 ? canvas.height : h
  const imageData = canvas.getContext('2d')!.getImageData(x, y, width, height)
  const result = createCanvas(width, height);
  result.getContext('2d')!.putImageData(imageData, 0, 0)
  return result;
}

function getDatestamp() {
  return new Date()
    .toISOString()
    .replace(/[^\dTt\.]/g, '')
    .replace(/\..*/g, '')
}

function epochToDate(epoch: number) {
  const createdDate = new Date(0);
  createdDate.setUTCSeconds(epoch);
  return createdDate
}
</script>

<style scoped>
@import './EditorView.css';
</style>
