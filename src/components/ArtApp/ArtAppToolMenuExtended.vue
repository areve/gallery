<template>
  <section
    class="tool-menu"
    :style="{
      top: topPercentCss,
    }"
  >
    <button type="button" class="brush1 brush" @click="brush('red', 0.25, 5)">brush1</button>
    <button type="button" class="brush2 brush" @click="brush('orange', 0.25, 5)">brush2</button>
    <button type="button" class="brush3 brush" @click="brush('yellow', 0.25, 5)">brush3</button>
    <button type="button" class="brush4 brush" @click="brush('green', 0.25, 5)">brush4</button>
    <button type="button" class="brush5 brush" @click="brush('blue', 0.25, 5)">brush5</button>
    <button type="button" class="brush6 brush" @click="brush('black', 0.25, 5)">brush6</button>
    <button type="button" class="brush7 brush" @click="brush('white', 0.25, 5)">brush7</button>
  </section>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { artAppState } from "./artAppState";
import { artboardState } from "../Artboard/artboardState";
import { brushToolState } from "../Brush/brushToolState";
import { eraserToolState } from "../Eraser/eraserToolState";

function brush(color: string, alpha: number, radius: number) {
  artboardState.value.selectedTool = "brush";
  brushToolState.value.color = color + ":" + alpha;
  brushToolState.value.radius = radius;
}
function eraser() {
  artboardState.value.selectedTool = "eraser";
  eraserToolState.value.radius = 30;
}
const topPercentCss = computed(() => Math.round(artAppState.value.edgeButtonStates.left.topPercent * 100) / 100 + "%");
</script>

<style scoped>
* {
  --brush-length: 3.5em;
  --brush-left: 2.6em;
}

.brush {
  position: fixed;
  margin-left: 7em;
  margin-top: 7em;
  width: var(--brush-length);
  height: 1em;
  transform-origin: -3.2em 50%;
  transition: 0.2s ease-out;
  transition-property: width, opacity;
  overflow: hidden;
  opacity: 0.8;
  color: transparent;
  border-radius: 40% 40%;
  border-bottom-right-radius: 50% 50%;
  border-top-right-radius: 50% 50%;
  display: block;
  padding: 0;
}
.tool-menu[hidden] .brush {
  width: 1em;
  opacity: 0;
}

.brush1 {
  transform: translate(var(--brush-left), -1.3em) rotate(-80deg);
  background-color: red;
}
.brush2 {
  transform: translate(var(--brush-left), -1.3em) rotate(-53.4deg);
  background-color: orange;
}
.brush3 {
  transform: translate(var(--brush-left), -1.3em) rotate(-26.6deg);
  background-color: yellow;
}
.brush4 {
  transform: translate(var(--brush-left), -1.3em) rotate(-0deg);
  background-color: green;
}
.brush5 {
  transform: translate(var(--brush-left), -1.3em) rotate(26.6deg);
  background-color: blue;
}
.brush6 {
  transform: translate(var(--brush-left), -1.3em) rotate(53.4deg);
  background-color: black;
}
.brush7 {
  transform: translate(var(--brush-left), -1.3em) rotate(80deg);
  background-color: white;
}

.tool-menu {
  user-select: none;
  position: fixed;
  border-radius: 50%;
  z-index: 150;
  transform: translate(-50%, -50%);
}

.tool-menu {
  left: 0;
  top: 50%;
  opacity: 1;
  width: 13em;
  height: 13em;
  transition-property: opacity;
}

.tool-menu[hidden] {
  display: block !important;
}

.budge {
  position: fixed;
  top: 50%;
  margin-left: 7em;
}
</style>
