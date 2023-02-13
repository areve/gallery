<template>
  <section
    class="panel prevent-select"
    v-if="panelState.visible"
    :class="{ docked: panelState.docked }"
    :style="{ top, left }"
  >
    <div class="panel-titlebar" @pointerdown="pointerDown">
      <h1 class="title">
        {{ title }}
      </h1>
      <button
        class="icon-button"
        type="button"
        @click="updatePanelState({ docked: !panelState.docked })"
        v-if="!panelState.rolled"
      >
        <i v-if="panelState.docked" class="fa-solid fa-lock"></i>
        <i v-else class="fa-solid fa-lock-open"></i>
        <span class="text">Dock/Undock</span>
      </button>
      <button
        class="icon-button"
        type="button"
        @click="updatePanelState({ rolled: !panelState.rolled })"
      >
        <i v-if="panelState.rolled" class="fa-solid fa-caret-up"></i>
        <i v-else class="fa-solid fa-caret-down"></i>
        <span class="text">Rollup</span>
      </button>
      <button
        class="icon-button"
        type="button"
        @click="updatePanelState({ visible: false })"
        v-if="!panelState.rolled"
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
import type { Coord } from "@/interfaces/Coord";
import { cloneExtend } from "@/lib/utils";
import { pointerMoveEvent, pointerUpEvent } from "@/services/pointerService";
import { computed, ref, watchSyncEffect } from "vue";
import type { PanelState } from "../EditorApp/panelStates";
interface Props {
  title: string;
  panelState: PanelState;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:panelState"]);

const origin = ref<Coord>({ x: 100, y: 100 });
const left = computed(() => origin.value.x + "px");
const top = computed(() => origin.value.y + "px");

function updatePanelState(value: Partial<PanelState>) {
  emit("update:panelState", cloneExtend(props.panelState, value));
}

let dragOrigin: (Coord & { originX: number; originY: number }) | null = null;

watchSyncEffect(() => {
  if (!pointerUpEvent.value) return;
  if (!dragOrigin) return;
  dragOrigin = null;
});

watchSyncEffect(() => {
  if (!pointerMoveEvent.value) return;
  if (!dragOrigin) return;
  const pointerEvent = pointerMoveEvent.value;
  const dy = pointerEvent.pageY - dragOrigin.y;
  const dx = pointerEvent.pageX - dragOrigin.x;
  origin.value.x = dragOrigin.originX + dx;
  origin.value.y = dragOrigin.originY + dy;
});

function pointerDown(event: PointerEvent) {
  dragOrigin = {
    x: event.pageX,
    y: event.pageY,
    originX: origin.value.x,
    originY: origin.value.y,
  };
}
</script>
<style>
.panel {
  position: absolute;
  z-index: 10;
  background-color: #e7e7e7;
  box-shadow: 0px 0.25em 0.5em #0007;
}

.panel-titlebar {
  background-color: #d0d0d0;
  text-align: right;
  padding: 0.25em;
  overflow: hidden;
}

.panel-main {
  padding: 0.25em;
}

.panel-titlebar .title {
  font-size: 1rem;
  font-weight: normal;
  float: left;
  margin-right: 1em;
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
  box-shadow: none;
}

.rolled {
  display: none;
}

.prevent-select {
  user-select: none;
}
</style>
