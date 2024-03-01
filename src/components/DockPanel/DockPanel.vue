<template>
  <section class="panel prevent-select" ref="panel">
    <header class="panel-titlebar">
      <button class="icon-button" type="button" @click="updatePanelState({ rolled: !panelState.rolled })">
        <i v-if="panelState.rolled" class="fa-solid fa-caret-up"></i>
        <i v-else class="fa-solid fa-caret-down"></i>
        <span class="text">Rollup</span>
      </button>
      <h1 class="title">{{ title }}</h1>
    </header>

    <main class="panel-main" :class="{ rolled: panelState.rolled }">
      <slot></slot>
    </main>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { PanelState } from "./PanelState";

import { cloneExtend } from "@/lib/utils";

interface Props {
  title: string;
  panelState: PanelState;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:panelState"]);

function updatePanelState(value: Partial<PanelState>) {
  emit("update:panelState", cloneExtend(props.panelState, value));
}
</script>
<style>
.panel-titlebar {
  background-color: #666;
  padding: 0.25em;
  min-height: 2.7em;
  flex: 0 0;
  overflow: hidden;
  display: flex;
}

.panel-main {
  padding: 0.25em;
  background-color: #e7e7e7;
  flex: 1 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.panel-titlebar .title {
  font-size: 1rem;
  font-weight: normal;
  float: left;
  margin-left: 1em;
  white-space: nowrap;
  flex: 1 0;
  font-style: italic;
  color: #ddd;
}

.icon-button {
  border-radius: 0;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background-color: #d0d0d0;
  flex: 0 0;
  min-width: 2rem;
  margin-left: 0.25em;
}

.icon-button .text {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  top: -10000px;
}

.rolled {
  display: none;
}

.prevent-select {
  user-select: none;
}
</style>
