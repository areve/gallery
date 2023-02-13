<template>
  <ToolPanel title="Toolbar" v-model:panelState="panelStates.toolbar">
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
      v-if="
        toolbarState.toolSelected === 'drag' ||
        toolbarState.toolSelected === 'drag-frame'
      "
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
  </ToolPanel>
</template>

<script lang="ts" setup>
import { brushToolState } from "@/components/Brush/brushToolState";
import { dragToolState } from "@/components/Artboard/dragToolState";
import { eraserToolState } from "@/components/Eraser/eraserToolState";
import { panelStates } from "@/components/EditorApp/panelStates";
import { toolbarState } from "@/components/Toolbar/toolbarState";
import type { MenuItem } from "../EditorApp/MenuItem";
import { addKeysForMenuItems } from "@/services/keyboardService";
import ToolPanel from "../ToolPanel/ToolPanel.vue";

const toolsMenu: MenuItem[] = [
  {
    label: "Eraser",
    action: () => (toolbarState.value.toolSelected = "eraser"),
    key: "Ctrl+1",
  },
  {
    label: "Drag",
    action: () => (toolbarState.value.toolSelected = "drag"),
    key: "Ctrl+2",
  },
  {
    label: "Drag Frame",
    action: () => (toolbarState.value.toolSelected = "drag-frame"),
    key: "Ctrl+3",
  },
  {
    label: "Pencil",
    action: () => (toolbarState.value.toolSelected = "pencil"),
    key: "Ctrl+4",
  },
];
addKeysForMenuItems(toolsMenu);
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
