<template>
  <section
    class="panel"
    v-if="panelState.visible"
    :class="{ docked: panelState.docked }"
  >
    <div class="panel-titlebar">
      <h1 class="title">{{ title }}</h1>
      <button
        class="icon-button"
        type="button"
        @click="$emit('update:docked', !panelState.docked)"
      >
        <i v-if="panelState.docked" class="fa-solid fa-lock"></i>
        <i v-else class="fa-solid fa-lock-open"></i>
        <span class="text">Dock/Undock</span>
      </button>
      <button
        class="icon-button"
        type="button"
        @click="$emit('update:rolled', !panelState.rolled)"
      >
        <i v-if="panelState.rolled" class="fa-solid fa-caret-up"></i>
        <i v-else class="fa-solid fa-caret-down"></i>
        <span class="text">Rollup</span>
      </button>
      <button
        class="icon-button"
        type="button"
        @click="$emit('update:visible', false)"
      >
        <i class="fa-solid fa-close"></i>
        <span class="text">Close</span>
      </button>
    </div>
    <div class="panel-main" :class="{ rolled: panelState.rolled }">
      <slot></slot>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { PanelState } from "../EditorApp/panelStates";

interface Props {
  title: string;
  panelState: PanelState;
}
defineProps<Props>();

defineEmits(["update:docked", "update:rolled", "update:visible"]);
</script>
<style>
.panel {
  position: absolute;
  /* left: 100px;
  top: 100px; */
  background-color: #e7e7e7;
}

.panel-titlebar {
  background-color: #d0d0d0;
  text-align: right;
  padding: 0.25em;
}

.panel-titlebar .title {
  font-size: 1rem;
  font-weight: normal;
  float: left;
  margin-right: 1em;
  margin-left: 0.5em;
}

.icon-button {
  border-radius: 0;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background-color: #d0d0d0;
}

.icon-button .text {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  top: -10000px;
}

.panel.docked {
  position: initial;
}

.rolled {
  display: none;
}
</style>
