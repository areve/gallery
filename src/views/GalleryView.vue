<template>
  <main>
    <h1>Gallery</h1>
    <ul class="gallery">
      <li v-for="item in list" class="gallery-item">
        <img :src="'/public/downloads/' + item.filename" />
      </li>
    </ul>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
export default defineComponent({
  name: "gallery",
  components: {},
  data() {
    return {
      list: [] as { filename: string }[],
    };
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      const response = await axios.get('/api/gallery/')
      this.list = response.data
    },
  },
})
</script>
<style scoped>
.gallery {
  list-style: none;  
  padding-left: 0;
}
.gallery-item{
  margin: 1em;
}
</style>