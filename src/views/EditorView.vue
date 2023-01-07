<template>
  <main>
    <h1>Editor</h1>
    <form>
      <label for="prompt">Prompt</label>
      <input type="text" id="prompt" v-model="prompt" />
      <button @click="create">Create</button>
      <button type="reset" @click="clear">Clear</button>
      <button type="button" @click="createVariation">Variation</button>
      <button type="button" @click="scale">Scale</button>
    </form>
    <div class="canvas-wrap">
      <div class="spinner" v-if="loading"></div>
      <canvas id="edit-canvas"></canvas>
    </div>
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
      loading: false
    };
  },
  mounted() {
    this.canvas.width = 1024
    this.canvas.height = 1024
    this.clear()
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
      this.context.clearRect(0, 0, 1024, 1024)
    },
    async scale() {
      // using toDataURL is not really efficient here but I had the code already!
      const original = this.canvas.toDataURL('image/png')
      this.clear()
      this.context.drawImage(await dataUrlToImage(original), 256, 256, 512, 512)
    },
    async createVariation() {
      this.loading = true
      const image = this.canvas.toDataURL('image/png')
      const response = await axios.post('/api/editor/createImageVariation', {
        image
      })

      this.context.drawImage(await dataUrlToImage(response.data[0].dataUrl), 0, 0)
      this.loading = false
    },
    async create() {
      this.loading = true
      const response = await axios.post('/api/editor/createImage', {
        prompt: this.prompt
      })

      this.context.drawImage(await dataUrlToImage(response.data[0].dataUrl), 0, 0)
      this.loading = false
    },
  },
})

function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    const tempImage = new Image()
    tempImage.onload = () => {
      resolve(tempImage)
    }
    tempImage.src = dataUrl
  })
} 
</script>

<style>
.canvas-wrap {
  background-color: #ccc;
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
</style>
