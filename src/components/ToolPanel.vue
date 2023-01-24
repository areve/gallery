<template>
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


</template>

<script  lang="ts" setup>
import { penSize, snapSize, toolSelected } from '@/services/appState';


</script>

<style scoped>
.use-tool {
  background-color: #f0f;
}

.tool-panel {
  margin: 0.4em;
}

.tool-panel h3 {
  display: none;
}
</style>