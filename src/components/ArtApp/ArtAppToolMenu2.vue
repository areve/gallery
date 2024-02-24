<template>
  <section
    class="tool-menu"
    :style="{
      top: topPercentCss,
    }"
  >
    <button type="button" class="brush1 brush" @click="brush('red', 5)">brush1</button>
    <button type="button" class="brush2 brush" @click="brush('orange', 5)">brush2</button>
    <button type="button" class="brush3 brush" @click="brush('yellow', 5)">brush3</button>
    <button type="button" class="brush4 brush" @click="brush('green', 5)">brush4</button>
    <button type="button" class="brush5 brush" @click="brush('blue', 5)">brush5</button>
    <button type="button" class="brush6 brush" @click="brush('black', 5)">brush6</button>
    <button type="button" class="brush7 brush" @click="brush('white', 5)">brush7</button>
  </section>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { artAppState } from "./artAppState";
import { artboardState } from "../Artboard/artboardState";
import { brushToolState } from "../Brush/brushToolState";
import { eraserToolState } from "../Eraser/eraserToolState";

function brush(color: string, radius: number) {
  artboardState.value.selectedTool = "brush";
  brushToolState.value.color = color;
  brushToolState.value.radius = radius;
}
function eraser() {
  artboardState.value.selectedTool = "eraser";
  eraserToolState.value.radius = 30;
}
const topPercentCss = computed(() => Math.round(artAppState.value.edgeButtonStates.left2.topPercent * 100) / 100 + "%");
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
  /* transform: ; */
  width: var(--brush-length);
  height: 1em;
  /* margin-left: 1em; */
  transform-origin: -3.2em 50%;
  transition: 0.4s ease-out;
  transition-property: width;
  overflow: hidden;
  opacity: 0.8;
  color: transparent;
  border-radius: 40% 40%;
  border-bottom-right-radius: 50% 50%;
  border-top-right-radius: 50% 50%;
}
.tool-menu[hidden] .brush {
  width: 0em;
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
/* button {
  border-radius: 0;
  margin: 0;
  display: block;
  width: 100%;
  color: #fff;
  background-color: #666;
} */

.tool-menu {
  user-select: none;
  position: fixed;
  border-radius: 50%;
  z-index: 150;
  /* width: 100%; */
  /* height: 13em; */
  /* box-shadow: 0em 0em 0.5em rgb(0, 0, 0, 0.8); */
  /* opacity: 0.6; */
  /* text-align: center; */
  /* top: v-bind(topPercentCss); */
  transform: translate(-50%, -50%);
  /* background-color: rgb(0, 100, 200, 0.5); */
  /* opacity: 0.5; */
  /* transition: all 0.2s ease-out-out; */
}

.tool-menu {
  left: 0;
  top: 50%;
  opacity: 1;
  width: 13em;
  height: 13em;
  /* overflow: hidden; */
  /* position: fixed; */
  transition: 0.4s ease-out;
  transition-property: opacity;
  
  /* overflow: hidden; */
}

.tool-menu[hidden] {
  /* width: 3em;
  height: 3em; */
  opacity: 0;
  display: block !important;
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
  transition: 0.2s ease-out-out;
  transition-property: opacity, left;
  overflow: hidden;
}

.left-menu[hidden] {
  left: -45%;
  opacity: 0.5;
  display: block !important;
} */
.budge {
  position: fixed;
  top: 50%;
  margin-left: 7em;
}
</style>
