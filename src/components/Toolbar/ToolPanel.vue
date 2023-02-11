<template>
  <div :hidden="!panelsVisibleState.toolbar" class="tool-panel">
    <section class="tool-panel">
      <h3>Tool</h3>
      <button
        type="button"
        @click="toolbarState.toolSelected = 'eraser'"
        :class="{ 'use-tool': toolbarState.toolSelected === 'eraser' }"
      >
        Eraser
      </button>
      <button
        type="button"
        @click="toolbarState.toolSelected = 'drag'"
        :class="{ 'use-tool': toolbarState.toolSelected === 'drag' }"
      >
        Drag
      </button>
      <button
        type="button"
        @click="toolbarState.toolSelected = 'drag-frame'"
        :class="{ 'use-tool': toolbarState.toolSelected === 'drag-frame' }"
      >
        Drag frame
      </button>
      <button
        type="button"
        @click="toolbarState.toolSelected = 'pencil'"
        :class="{ 'use-tool': toolbarState.toolSelected === 'pencil' }"
      >
        Pencil
      </button>
    </section>
    <section class="tool-panel" v-if="toolbarState.toolSelected === 'eraser'">
      <h3>Eraser Settings</h3>
      <label for="eraserSize">Eraser size</label>
      <input
        type="number"
        id="eraserSize"
        v-model="eraserToolState.eraserSize"
        step="5"
        min="0"
        max="1000"
      />
    </section>
    <section
      class="tool-panel"
      v-if="toolbarState.toolSelected === 'drag' || toolbarState.toolSelected === 'drag-frame'"
    >
      <h3>Drag Settings</h3>
      <label for="snap">snap</label>
      <input
        type="number"
        id="snap"
        v-model="dragToolState.snapSize"
        step="1"
        min="1"
        max="256"
      />
    </section>
    <section class="tool-panel" v-if="toolbarState.toolSelected === 'pencil'">
      <h3>Pencil Settings</h3>
      <label for="brushColor">Colour</label>
      <input type="color" id="brushColor" v-model="brushToolState.brushColor" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import { brushToolState } from "@/components/Brush/brushToolState";
import { dragToolState } from "@/components/Artboard/dragToolState";
import { eraserToolState } from "@/components/Eraser/eraserToolState";
import { panelsVisibleState } from "@/components/EditorApp/panelsVisibleState"
import { toolbarState } from "@/components/Toolbar/toolbarState";
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
