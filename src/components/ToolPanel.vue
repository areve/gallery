<template>
  <div :hidden="!toolbarVisible" class="tool-panel">
    <section class="tool-panel">
      <h3>Tool</h3>
      <button
        type="button"
        @click="toolSelected = 'eraser'"
        :class="{ 'use-tool': toolSelected === 'eraser' }"
      >
        Eraser
      </button>
      <button
        type="button"
        @click="toolSelected = 'drag'"
        :class="{ 'use-tool': toolSelected === 'drag' }"
      >
        Drag
      </button>
      <button
        type="button"
        @click="toolSelected = 'drag-frame'"
        :class="{ 'use-tool': toolSelected === 'drag-frame' }"
      >
        Drag frame
      </button>
      <button
        type="button"
        @click="toolSelected = 'pencil'"
        :class="{ 'use-tool': toolSelected === 'pencil' }"
      >
        Pencil
      </button>
    </section>
    <section class="tool-panel" v-if="toolSelected === 'eraser'">
      <h3>Eraser Settings</h3>
      <label for="eraserSize">Eraser size</label>
      <input
        type="number"
        id="eraserSize"
        v-model="eraserSize"
        step="5"
        min="0"
        max="1000"
      />
    </section>
    <section
      class="tool-panel"
      v-if="toolSelected === 'drag' || toolSelected === 'drag-frame'"
    >
      <h3>Drag Settings</h3>
      <label for="snap">snap</label>
      <input
        type="number"
        id="snap"
        v-model="snapSize"
        step="1"
        min="1"
        max="256"
      />
    </section>
    <section class="tool-panel" v-if="toolSelected === 'pencil'">
      <h3>Pencil Settings</h3>
      <label for="pencilColor">Colour</label>
      <input type="color" id="pencilColor" v-model="pencilColor" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import {
  eraserSize,
  snapSize,
  toolSelected,
  pencilColor,
  toolbarVisible,
} from "@/services/editorAppState";
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
