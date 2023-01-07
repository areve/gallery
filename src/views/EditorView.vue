<template>
  <main>
    <h1>Editor</h1>
    <form>
      <label for="prompt">Prompt</label>
      <input type="text" id="prompt" v-model="prompt" />
      <button @click="create">Create</button>
    </form>
    <div class="canvas">
      <img :src="imageSrc" />
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
      imageSrc: '/gallery-example/mud-cat.png',
      prompt: 'cat made out of coloured mud',
      result: "hello, press Create",
    };
  },
  methods: {
    async create() {
      const response = await axios.post('/api/createImage', {
        prompt: this.prompt
      })
      this.imageSrc = response.data[0].dataUrl 
    },
  },
})
</script>

<style>

</style>
