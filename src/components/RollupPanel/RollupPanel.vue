<template>
  <section class="panel prevent-select" ref="panel">
    <!-- <div v-if="!panelState.rolled && !panelState.docked" class="resize-handle bottom" @pointerdown="resizeStart($event, 'bottom')"></div>
    <div v-if="!panelState.rolled && !panelState.docked" class="resize-handle right" @pointerdown="resizeStart($event, 'right')"></div>
    <div v-if="!panelState.rolled && !panelState.docked" class="resize-handle left" @pointerdown="resizeStart($event, 'left')"></div>
    <div v-if="!panelState.rolled && !panelState.docked" class="resize-handle top" @pointerdown="resizeStart($event, 'top')"></div>
    <div v-if="!panelState.rolled && !panelState.docked" class="resize-handle top-left" @pointerdown="resizeStart($event, 'top-left')"></div>
    <div v-if="!panelState.rolled && !panelState.docked" class="resize-handle top-right" @pointerdown="resizeStart($event, 'top-right')"></div>
    <div v-if="!panelState.rolled && !panelState.docked" class="resize-handle bottom-left" @pointerdown="resizeStart($event, 'bottom-left')"></div>
    <div v-if="!panelState.rolled && !panelState.docked" class="resize-handle bottom-right" @pointerdown="resizeStart($event, 'bottom-right')"></div>
    -->
    <header class="panel-titlebar">
      <!-- <button class="icon-button" type="button" @click="updatePanelState({ docked: !panelState.docked })" v-if="!panelState.rolled">
        <i v-if="panelState.docked" class="fa-solid fa-lock"></i>
        <i v-else class="fa-solid fa-lock-open"></i>
        <span class="text">Dock/Undock</span>
      </button>-->
      <button class="icon-button" type="button" @click="updatePanelState({ rolled: !panelState.rolled })">
        <i v-if="panelState.rolled" class="fa-solid fa-caret-up"></i>
        <i v-else class="fa-solid fa-caret-down"></i>
        <span class="text">Rollup</span>
      </button>
      <!--<button class="icon-button" type="button" @click="updatePanelState({ visible: false })" v-if="!panelState.rolled">
        <i class="fa-solid fa-close"></i>
        <span class="text">Close</span>
      </button> -->
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

// import type { Coord } from "@/interfaces/Coord";
import { cloneExtend } from "@/lib/utils";
// import { pointerMoveEvent, pointerUpEvent } from "@/services/pointerService";
// import { computed, ref, watchSyncEffect } from "vue";
// import type { PanelState } from "../EditorApp/panelStates";
// import { moveToTop, registerZIndex } from "./zIndexService";
// import { v4 as uuid } from "uuid";
// TODO messy file, don't like the name either, it should be ToolPanel or something

interface Props {
  title: string;
  panelState: PanelState;
}

//const panel = ref<HTMLDivElement>(undefined!);

const props = defineProps<Props>();
const emit = defineEmits(["update:panelState"]);

// const origin = ref<Coord>({ x: 0, y: 0 });
// const grow = ref<Coord>({ x: 0, y: 0 });
// const left = computed(() => props.panelState.position.x + origin.value.x + "px");
// const top = computed(() => props.panelState.position.y + origin.value.y + "px");
// const zIndex = computed(() => {
//   if (props.panelState.docked) return 0;
//   return props.panelState.zIndex;
// });
// const width = computed(() => {
//   if (props.panelState.docked || props.panelState.rolled) return "auto";
//   if (!props.panelState.size && !resizeOrigin) return "auto";
//   const size = props.panelState.size ?? {
//     x: resizeOrigin!.startWidth,
//     y: resizeOrigin!.startHeight,
//   };
//   return size.x + grow.value.x + "px";
// });
// const height = computed(() => {
//   if (props.panelState.docked || props.panelState.rolled) return "auto";
//   if (!props.panelState.size && !resizeOrigin) return "auto";
//   const size = props.panelState.size ?? {
//     x: resizeOrigin!.startWidth,
//     y: resizeOrigin!.startHeight,
//   };
//   return size.y + grow.value.y + "px";
// });

function updatePanelState(value: Partial<PanelState>) {
  emit("update:panelState", cloneExtend(props.panelState, value));
}

// type Handle = "bottom" | "right" | "left" | "top" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
// let dragOrigin: (Coord & { originX: number; originY: number }) | null = null;
// let resizeOrigin: (Coord & { startWidth: number; startHeight: number; handle: Handle }) | null = null;

// const id = uuid();

// registerZIndex(id, props.panelState.zIndex, (zIndex) => {
//   updatePanelState({ zIndex });
// });

// watchSyncEffect(() => {
//   if (!pointerUpEvent.value) return;
//   if (dragOrigin) dragEnd(pointerUpEvent.value);
//   if (resizeOrigin) resizeEnd(pointerUpEvent.value);
// });

// watchSyncEffect(() => {
//   if (!pointerMoveEvent.value) return;
//   if (dragOrigin) return dragMove(pointerMoveEvent.value);
//   if (resizeOrigin) return resizeMove(pointerMoveEvent.value);
// });

// function resizeStart(event: PointerEvent, handle: Handle) {
//   resizeOrigin = {
//     x: event.pageX,
//     y: event.pageY,
//     startWidth: panel.value.offsetWidth,
//     startHeight: panel.value.offsetHeight,
//     handle,
//   };
// }

// function resizeEnd(_pointerEvent: PointerEvent) {
//   if (!resizeOrigin) return;

//   updatePanelState({
//     size: {
//       x: resizeOrigin.startWidth + grow.value.x,
//       y: resizeOrigin.startHeight + grow.value.y,
//     },
//     position: {
//       x: props.panelState.position.x + origin.value.x,
//       y: props.panelState.position.y + origin.value.y,
//     },
//   });
//   resizeOrigin = null;
//   grow.value = { x: 0, y: 0 };
//   origin.value = { x: 0, y: 0 };
// }

// function resizeMove(pointerEvent: PointerEvent) {
//   if (!resizeOrigin) return;

//   if (resizeOrigin.handle === "bottom-right") {
//     grow.value = {
//       x: pointerEvent.pageX - resizeOrigin.x,
//       y: pointerEvent.pageY - resizeOrigin.y,
//     };
//   } else if (resizeOrigin.handle === "bottom") {
//     grow.value = {
//       x: grow.value.x,
//       y: pointerEvent.pageY - resizeOrigin.y,
//     };
//   } else if (resizeOrigin.handle === "right") {
//     grow.value = {
//       x: pointerEvent.pageX - resizeOrigin.x,
//       y: grow.value.y,
//     };
//   } else if (resizeOrigin.handle === "top") {
//     origin.value.y = pointerEvent.pageY - resizeOrigin.y;
//     grow.value = {
//       x: grow.value.x,
//       y: -(pointerEvent.pageY - resizeOrigin.y),
//     };
//   } else if (resizeOrigin.handle === "left") {
//     origin.value.x = pointerEvent.pageX - resizeOrigin.x;
//     grow.value = {
//       x: -(pointerEvent.pageX - resizeOrigin.x),
//       y: grow.value.y,
//     };
//   } else if (resizeOrigin.handle === "top-left") {
//     origin.value.x = pointerEvent.pageX - resizeOrigin.x;
//     origin.value.y = pointerEvent.pageY - resizeOrigin.y;
//     grow.value = {
//       x: -(pointerEvent.pageX - resizeOrigin.x),
//       y: -(pointerEvent.pageY - resizeOrigin.y),
//     };
//   } else if (resizeOrigin.handle === "top-right") {
//     origin.value.y = pointerEvent.pageY - resizeOrigin.y;
//     grow.value = {
//       x: pointerEvent.pageX - resizeOrigin.x,
//       y: -(pointerEvent.pageY - resizeOrigin.y),
//     };
//   } else if (resizeOrigin.handle === "bottom-left") {
//     origin.value.x = pointerEvent.pageX - resizeOrigin.x;
//     grow.value = {
//       x: -(pointerEvent.pageX - resizeOrigin.x),
//       y: pointerEvent.pageY - resizeOrigin.y,
//     };
//   }
// }

// function dragStart(event: PointerEvent) {
//   dragOrigin = {
//     x: event.pageX,
//     y: event.pageY,
//     originX: props.panelState.position.x,
//     originY: props.panelState.position.y,
//   };
// }

// function dragEnd(_pointerEvent: PointerEvent) {
//   if (!dragOrigin) return;
//   updatePanelState({
//     position: {
//       x: dragOrigin.originX + origin.value.x,
//       y: dragOrigin.originY + origin.value.y,
//     },
//   });
//   dragOrigin = null;
//   origin.value = { x: 0, y: 0 };
// }

// function dragMove(pointerEvent: PointerEvent) {
//   if (!dragOrigin) return;
//   origin.value.x = pointerEvent.pageX - dragOrigin.x;
//   origin.value.y = pointerEvent.pageY - dragOrigin.y;
// }

// function bringToFront(_event: PointerEvent) {
//   if (props.panelState.docked) return;
//   moveToTop(id);
// }
</script>
<style>
/*
.panel {
  position: absolute;
  box-shadow: 0px 0.25em 0.5em #0007;
  overflow: hidden;
  background-color: #e7e7e7;
  display: flex;
  flex-direction: column;
}
*/
/*
* {
  --resize-border-size: 6px;
}

.resize-handle {
  content: " ";
  position: absolute;
  display: block;
  width: var(--resize-border-size);
  height: var(--resize-border-size);
  z-index: 1;
}

.resize-handle.bottom {
  width: calc(100%);
  bottom: 0;
  right: 0;
  cursor: s-resize;
}

.resize-handle.top {
  width: calc(100%);
  top: 0;
  right: 0;
  cursor: n-resize;
}

.resize-handle.right {
  height: calc(100%);
  bottom: 0;
  right: 0;
  cursor: e-resize;
}

.resize-handle.left {
  height: calc(100%);
  bottom: 0;
  left: 0;
  cursor: w-resize;
}

.resize-handle.top-left,
.resize-handle.top-left::after,
.resize-handle.top-right,
.resize-handle.top-right::after,
.resize-handle.bottom-left,
.resize-handle.bottom-left::after,
.resize-handle.bottom-right,
.resize-handle.bottom-right::after {
  width: var(--resize-border-size);
  height: calc(var(--resize-border-size) * 5);
  position: absolute;
}

.resize-handle.top-left::after,
.resize-handle.top-right::after,
.resize-handle.bottom-left::after,
.resize-handle.bottom-right::after {
  content: " ";
  display: block;
  width: calc(var(--resize-border-size) * 5);
  height: var(--resize-border-size);
}

.resize-handle.top-left,
.resize-handle.top-left::after {
  top: 0;
  left: 0;
  cursor: nw-resize;
}

.resize-handle.top-right,
.resize-handle.top-right::after {
  top: 0;
  right: 0;
  cursor: ne-resize;
}

.resize-handle.bottom-left,
.resize-handle.bottom-left::after {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
}
.resize-handle.bottom-right,
.resize-handle.bottom-right::after {
  bottom: 0;
  right: 0;
  cursor: se-resize;
}
*/
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
/*

.panel.docked {
  position: initial;
  box-shadow: none;
}
*/
.rolled {
  display: none;
}

.prevent-select {
  user-select: none;
}
</style>
