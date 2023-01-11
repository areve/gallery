<template>
  <div class="layout">
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
        <button type="button" @click="create()">Create</button>
        <button type="reset" @click="reset()">Reset</button>
        <button type="button" @click="createVariation()">Variation</button>
        <button type="button" @click="edit()">Fill</button>
        <button type="button" @click="scale()">Scale</button>
        <label for="scaleBy">by</label>
        <input type="number" id="scaleBy" v-model="scaleBy" step="0.00001" min="0" />
        <button type="button" @click="deleteImage()">Delete</button>
        <input type="text" v-model="filename" />
        <button type="button" @click="showMetadata = !showMetadata">Toggle Metadata</button>
        <button type="button" @click="saveImage()">Save Metadata</button>
      </form>
      <div class="document-panel">
        <div class="document">
          <div class="spinner" v-if="loading"></div>
          <canvas id="edit-canvas"></canvas>
        </div>
      </div>
    </main>
    <aside class="side-panel">
      <ul class="gallery">
        <li v-for="item in list" class="gallery-item">
          <button type="button" @click="selectImage('/downloads/' + item.filename, item)"><img
              :src="'/downloads/' + item.filename" /></button>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
export default defineComponent({
  name: "editor",
  components: {},
  data() {
    return {
      imageSrc: '',
      filename: '',
      prompt: '',
      showMetadata: false,
      metadataField: '',
      metadataAsJson: '',
      scaleBy: 0.5,
      loading: false,
      list: [] as { filename: string }[],
    };
  },
  mounted() {
    this.canvas.width = 1024
    this.canvas.height = 1024
    this.loadState()
    this.getList()
  },
  computed: {
    canvas() {
      return document.getElementById(
        "edit-canvas"
      ) as HTMLCanvasElement
    },
    context(): CanvasRenderingContext2D {
      return this.canvas.getContext('2d')!
    },
    metadata: {
      get() {
        let result
        try {
          result = JSON.parse(this.metadataField)
        }catch(e){
          alert('cannot parse metadata' + this.metadataField)
          throw 'cannot parse metadata'
        }
        return result
      },
      set(value: any) { 
        this.metadataAsJson = JSON.stringify(value, null, '  ')
        this.metadataField = JSON.stringify(value, null, '  ')
      }
    }
  },
  methods: {
    clearCanvas() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },
    reset() {
      this.clearCanvas()
      this.metadata = ''
      this.prompt = ''
      this.filename = ''
    },
    async saveImage() {
      this.loading = true
      const response = await axios.post('/api/editor/saveImage', {
        filename: this.filename,
        metadata: this.metadata
      })

      this.filename = response.data[0].filename
      this.metadata = response.data[0].metadata

      this.loading = false
      this.saveState()
      this.getList()
    },
    saveState() {
      window.localStorage.setItem('image', this.canvas.toDataURL())
      window.localStorage.setItem('metadata', this.metadataAsJson)
      window.localStorage.setItem('prompt', this.prompt)
      window.localStorage.setItem('filename', this.filename)
    },
    async loadState() {
      this.clearCanvas()
      const dataUrl = window.localStorage.getItem('image')
      if (dataUrl) this.context.drawImage(await loadImage(dataUrl), 0, 0)
      this.metadata = JSON.parse(window.localStorage.getItem('metadata') || '' )
      this.prompt = window.localStorage.getItem('prompt') || ''
      this.filename = window.localStorage.getItem('filename') || ''
    },
    async selectImage(url: string, item: any) {
      this.context.drawImage(await loadImage(url), 0, 0)
      const history = JSON.parse(JSON.stringify(Array.isArray(item.metadata.history) ? item.metadata.history : [item.metadata.history])).reverse()
      this.prompt = history.filter(i => i.prompt)[0]?.prompt || ''
      this.filename = item.filename
      this.metadata = item.metadata
      this.saveState()
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
      this.metadata = ''
      this.clearCanvas()
      this.saveState()
      this.getList()
    },
    async createVariation() {
      const image = this.canvas.toDataURL('image/png')
      this.loading = true
      const response = await axios.post('/api/editor/createImageVariation', {
        image,
        metadata: this.metadata
      })

      this.context.drawImage(await loadImage(response.data[0].dataUrl), 0, 0)
      this.filename = response.data[0].filename
      this.metadata = response.data[0].metadata
      const history = JSON.parse(JSON.stringify(Array.isArray(response.data[0].metadata.history) ? response.data[0].metadata.history : [response.data[0].metadata.history])).reverse()
      this.prompt = history.filter(i => i.prompt)[0]?.prompt || ''
      
      this.loading = false
      this.saveState()
      this.getList()
    },

    async edit() {
      const image = this.canvas.toDataURL('image/png')
      const mask = this.canvas.toDataURL('image/png')
      this.loading = true
      const response = await axios.post('/api/editor/createImageEdit', {
        image,
        mask,
        prompt: this.prompt,
        metadata: this.metadata
      })

      this.context.drawImage(await loadImage(response.data[0].dataUrl), 0, 0)
      this.filename = response.data[0].filename
      this.metadata = response.data[0].metadata
      this.prompt = response.data[0].prompt

      this.loading = false
      this.saveState()
      this.getList()
    },
    async create() {
      this.loading = true
      const response = await axios.post('/api/editor/createImage', {
        prompt: this.prompt,
      })

      this.context.drawImage(await loadImage(response.data[0].dataUrl), 0, 0)
      this.filename = response.data[0].filename
      this.metadata = response.data[0].metadata
      this.prompt = response.data[0].prompt

      this.loading = false
      this.saveState()
      this.getList()
    },
    async getList() {
      const response = await axios.get('/api/gallery/')
      this.list = response.data
    },

  },
})

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    const tempImage = new Image()
    tempImage.onload = () => {
      resolve(tempImage)
    }
    tempImage.src = dataUrl
  })
}

function cloneCanvas(canvas: HTMLCanvasElement) {
  const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.width)
  const result = document.createElement('canvas');
  result.width = canvas.width
  result.height = canvas.height
  result.getContext('2d')!.putImageData(imageData, 0, 0)
  return result;
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
  grid-template-areas:
    "menu"
    "controls"
    "document"
  ;
  height: 100%;
  background-color: #ccc7;
}

.menu {
  background-color: #000;
  color: #fff;
  padding: 0.2em;
  grid-area: menu;
}

.menu-list {
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: row;
}

.menu-item {
  padding: 0.1em 0.4em;
}

.form-controls {
  padding: 0.4em;
  grid-area: document;
  overflow: hidden;
  position: relative;
}

.document-panel {
  grid-area: controls;
  overflow: hidden;
  position: relative;
  margin: 0.5em;
}

.side-panel {
  grid-area: sidebar;
  overflow-y: scroll;
  padding: 0.4em;
  background-color: #ccc7;
}

.document {
  aspect-ratio: 1024 / 1024;
  height: calc(min(100%, 70vw));
  margin: auto;
  background-color: #f7f7f7;
  background-image:
    linear-gradient(45deg, #ddd 25%, transparent 25%),
    linear-gradient(135deg, #ddd 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ddd 75%),
    linear-gradient(135deg, transparent 75%, #ddd 75%);
  background-size: 20px 20px;
  background-position: 0 0, 10px 0, 10px -10px, 0px 10px;
  background-repeat: repeat;
}

#edit-canvas {
  width: 100%;
  height: 100%;
}

#prompt {
  width: 100%;
  height: 3.2em;
}

.metadata {
  width: 100%;
  height: 9.6em;
}

.spinner {
  position: absolute;
  left: 50%;
  padding-top: calc(50% - 60px);
  width: 80px;
  height: 80px;
  margin-left: -40px;
  margin-top: -40px;
}

.spinner:after {
  content: " ";
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: spinner 1.2s linear infinite;
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.gallery {
  list-style: none;
  padding-left: 0;
  display: block;
}

.gallery-item {
  margin: 2px;
  width: 100px;
  height: 100px;
  display: inline-block;
}
</style>
