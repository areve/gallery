<template>
  <div :hidden="!editorAppState.toolbarVisible" class="tool-panel">
    <section class="tool-panel">
      <h3>Tool</h3>
      <button
        type="button"
        @click="editorAppState.toolSelected = 'eraser'"
        :class="{ 'use-tool': editorAppState.toolSelected === 'eraser' }"
      >
        Eraser
      </button>
      <button
        type="button"
        @click="editorAppState.toolSelected = 'drag'"
        :class="{ 'use-tool': editorAppState.toolSelected === 'drag' }"
      >
        Drag
      </button>
      <button
        type="button"
        @click="editorAppState.toolSelected = 'drag-frame'"
        :class="{ 'use-tool': editorAppState.toolSelected === 'drag-frame' }"
      >
        Drag frame
      </button>
      <button
        type="button"
        @click="editorAppState.toolSelected = 'pencil'"
        :class="{ 'use-tool': editorAppState.toolSelected === 'pencil' }"
      >
        Pencil
      </button>
    </section>
    <section class="tool-panel" v-if="editorAppState.toolSelected === 'eraser'">
      <h3>Eraser Settings</h3>
      <label for="eraserSize">Eraser size</label>
      <input
        type="number"
        id="eraserSize"
        v-model="editorAppState.eraserSize"
        step="5"
        min="0"
        max="1000"
      />
    </section>
    <section
      class="tool-panel"
      v-if="editorAppState.toolSelected === 'drag' || editorAppState.toolSelected === 'drag-frame'"
    >
      <h3>Drag Settings</h3>
      <label for="snap">snap</label>
      <input
        type="number"
        id="snap"
        v-model="editorAppState.snapSize"
        step="1"
        min="1"
        max="256"
      />
    </section>
    <section class="tool-panel" v-if="editorAppState.toolSelected === 'pencil'">
      <h3>Pencil Settings</h3>
      <label for="brushColor">Colour</label>
      <input type="color" id="brushColor" v-model="editorAppState.brushColor" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import { editorAppState } from "@/services/editorAppState";
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
