<template>
  <section
    class="tool-menu"
    :style="{
      top: topPercentCss,
    }"
  ></section>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { artAppState } from "./artAppState";

// import { artboardState } from "@/components/Artboard/artboardState";
// import BrushPanel from "@/components/Brush/BrushPanel.vue";
// import EraserPanel from "@/components/Eraser/EraserPanel.vue";

// function pencil() {
//   artboardState.value.selectedTool = "brush";
// }
// function eraser() {
//   artboardState.value.selectedTool = "eraser";
// }
const topPercentCss = computed(() => artAppState.value.edgeButtonStates.left2.topPercent + "%");
</script>

<style scoped>
/* button {
  border-radius: 0;
  margin: 0;
  display: block;
  width: 100%;
  color: #fff;
  background-color: #666;
} */

.tool-menu {
  position: fixed;
  border-radius: 6.5em;
  z-index: 150;
  width: 13em;
  height: 13em;
  box-shadow: 0em 0em 0.5em rgb(0, 0, 0, 0.8);
  opacity: 0.6;
  text-align: center;
  top: v-bind(topPercentCss);
  transform: translate(-50%, -50%);
  background-color: lightseagreen;
  /* transition: all 0.2s ease-in-out; */
}
/* .tool-menu[hidden] {
  left: -45%;
  opacity: 0.5;
  display: block !important;
} */
/* .left-menu,
.right-menu {
  position: fixed;
  width: 20%;
  height: 100%;
  background-color: rgb(127, 127, 127, 0.95);
  z-index: 50;
  transition: all 0.2s ease-in-out;
  overflow: hidden;
}

.left-menu[hidden] {
  left: -45%;
  opacity: 0.5;
  display: block !important;
} */
</style>
