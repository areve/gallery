<template>
  <main>
    <h1>Editor</h1>
    <form>
      <label for="prompt">Prompt</label>
      <input type="text" id="prompt" v-model="prompt" />
      <button @click="create">Create</button>
      <textarea v-model="result"></textarea>
    </form>
    <div class="canvas">
      <img src="/gallery-example/mud-cat.png" />
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
      prompt: 'example',
      result: "hello, press Create",
    };
  },
  methods: {
    async create() {
      const response = await axios.post('/api/createImage', {
        prompt: this.prompt
      })
      this.result = JSON.stringify(response.data) + this.prompt
    },
  },
})
</script>

<style>

</style>
