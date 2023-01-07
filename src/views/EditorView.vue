<template>
  <main>
    <h1>Editor</h1>
    <form>
      <label for="prompt">Prompt</label>
      <input type="text" id="prompt" v-model="prompt" />
      <button @click="create">Create</button>
      <button type="reset" @click="clear">Clear</button>
      <button @click="createVariation">Variation</button>
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
    async createVariation() {
      return new Promise(async (resolve, reject) => {
        this.loading = true
        const image = this.canvas.toDataURL('image/png') 
        console.log(image)
        const response = await axios.post('/api/editor/createImageVariation', {
          image
        })

        const tempImage = new Image()
        tempImage.onload = () => {
          this.context.drawImage(tempImage, 0, 0)
          this.loading = false
          resolve(true)
        }
        tempImage.src = response.data[0].dataUrl
      })

    },
    async create() {
      return new Promise(async (resolve, reject) => {
        this.loading = true
        const response = await axios.post('/api/editor/createImage', {
          prompt: this.prompt
        })

        const tempImage = new Image()
        tempImage.onload = () => {
          this.context.drawImage(tempImage, 0, 0)
          this.loading = false
          resolve(true)
        }
        tempImage.src = response.data[0].dataUrl
      })
    },
  },
})

</script>

<style>
.canvas-wrap{
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
