<template>
  <main>
    <h1>Editor</h1>
    <form>
      <label for="prompt">Prompt</label>
      <input type="text" id="prompt" v-model="prompt" />
      <button @click="create">Create</button>
      <button type="reset" @click="clear">Clear</button>
    </form>
    <div class="canvas">
      <div class="placeholder" v-if="!imageSrc" >
        <div class="spinner" v-if="loading"></div>
      </div>
      <img :src="imageSrc" v-if="imageSrc" />
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
      loading: false,
    };
  },
  methods: {
    clear() {
      this.imageSrc = ''
    },
    async create() {
      this.loading = true
      const response = await axios.post('/api/editor/createImage', {
        prompt: this.prompt
      })
      this.loading = false
      this.imageSrc = response.data[0].dataUrl 
    },
  },
})
</script>

<style>
.placeholder{
  background-color: #ccc;
  width: 100%;
  padding-bottom: 100%;
  
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
