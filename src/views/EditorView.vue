<template>
  <main class="main">
    <div class="editor">
      <h1>Editor</h1>
      <form>
        <label for="prompt">Prompt</label>
        <textarea type="text" id="prompt" v-model="prompt"></textarea>
        <button type="button" @click="create()">Create</button>
        <button type="reset" @click="clear()">Clear</button>
        <button type="button" @click="createVariation()">Variation</button>
        <button type="button" @click="scale()">Scale</button>
        <button type="button" @click="edit()">Edit</button>
        <button type="button" @click="save()">Save</button>
        <label for="scaleBy">By</label>
        <input type="number" id="scaleBy" v-model="scaleBy" step="0.00001" min="0" />
      </form>
      <div class="canvas-wrap">
        <div class="spinner" v-if="loading"></div>
        <canvas id="edit-canvas"></canvas>
      </div>
    </div>
    <ul class="gallery">
      <li v-for="item in list" class="gallery-item">
        <button type="button" @click="selectImage('/public/downloads/' + item.filename)"><img
            :src="'/public/downloads/' + item.filename" /></button>
      </li>
    </ul>

  </main>
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
      prompt: '',
      scaleBy: 0.5,
      loading: false,
      list: [] as { filename: string }[],
    };
  },
  mounted() {
    this.canvas.width = 1024
    this.canvas.height = 1024
    this.load()
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
    }
  },
  methods: {
    clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },
    save() {
      window.localStorage.setItem('image', this.canvas.toDataURL())
    },
    async selectImage(url: string) {
      this.context.drawImage(await loadImage(url), 0, 0)

    },
    async load() {
      this.clear()
      const dataUrl = window.localStorage.getItem('image')
      if (dataUrl) this.context.drawImage(await loadImage(dataUrl), 0, 0)
    },
    async scale() {
      const clone = cloneCanvas(this.canvas)
      this.clear()
      this.context.drawImage(
        clone,
        (this.canvas.width - clone.width * this.scaleBy) / 2,
        (this.canvas.height - clone.height * this.scaleBy) / 2,
        clone.width * this.scaleBy,
        clone.height * this.scaleBy)
    },

    async createVariation() {
      this.loading = true
      const image = this.canvas.toDataURL('image/png')
      const response = await axios.post('/api/editor/createImageVariation', {
        image
      })

      this.context.drawImage(await loadImage(response.data[0].dataUrl), 0, 0)
      this.loading = false
      this.getList()
    },

    async edit() {
      this.loading = true
      const image = this.canvas.toDataURL('image/png')
      const mask = this.canvas.toDataURL('image/png')
      const response = await axios.post('/api/editor/createImageEdit', {
        image,
        mask,
        prompt: this.prompt
      })

      this.context.drawImage(await loadImage(response.data[0].dataUrl), 0, 0)
      this.loading = false
      this.getList()
    },
    async create() {
      this.loading = true
      const response = await axios.post('/api/editor/createImage', {
        prompt: this.prompt
      })

      this.context.drawImage(await loadImage(response.data[0].dataUrl), 0, 0)
      this.loading = false
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

.main {
  display: flex;
}
.gallery {
  position: fixed;
  width: 30%;
  overflow: scroll;
  height: 100vh ;
  right: 0;
  top: 0;
}

.editor {
  position: fixed;
  width: 70%;
  left: 0;
  top: 0;
}

#prompt {
  width: 100%;
  height: 2em;
}

.canvas-wrap {
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

.spinner {
  position: absolute;
  left: 50%;
  padding-top: 50%;
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
