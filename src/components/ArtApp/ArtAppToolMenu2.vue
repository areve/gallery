<template>
  <section
    class="tool-menu"
    :style="{
      top: topPercentCss,
    }"
  >
    <button type="button" class="pencil1 pencil" @click="pencil('red')">Pencil1</button>
    <button type="button" class="pencil2 pencil" @click="pencil('orange')">Pencil2</button>
    <button type="button" class="pencil3 pencil" @click="pencil('yellow')">Pencil3</button>
    <button type="button" class="pencil4 pencil" @click="pencil('green')">Pencil4</button>
    <button type="button" class="pencil5 pencil" @click="pencil('blue')">Pencil5</button>
    <button type="button" class="pencil6 pencil" @click="pencil('black')">Pencil6</button>
    <button type="button" class="pencil7 pencil" @click="eraser('white')">Pencil7</button>
  </section>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { artAppState } from "./artAppState";
import { artboardState } from "../Artboard/artboardState";
import { brushToolState } from "../Brush/brushToolState";
import { eraserToolState } from "../Eraser/eraserToolState";

function pencil(color: string) {
  artboardState.value.selectedTool = "brush";
  brushToolState.value.color = color;
  brushToolState.value.radius = 5;
}
function eraser() {
  artboardState.value.selectedTool = "eraser";
  eraserToolState.value.radius = 30;
}
const topPercentCss = computed(() => Math.round(artAppState.value.edgeButtonStates.left2.topPercent * 100) / 100 + "%");
</script>

<style scoped>
* {
  --pencil-length: 3.5em;
  --pencil-left: 2.6em;
}

.pencil {
  position: fixed;
  margin-left: 7em;
  margin-top: 7em;
  /* transform: ; */
  width: var(--pencil-length);
  height: 1em;
  /* margin-left: 1em; */
  transform-origin: -3.2em 50%;
  transition: all 0.2s ease-in-out;
  overflow: hidden;
  opacity: 0.8;
  color: transparent;
  border-bottom-right-radius: 50% 50%;
  border-top-right-radius: 50% 50%;
}
.tool-menu[hidden] .pencil {
  width: 0em;
}

.pencil1 {
  transform: translate(var(--pencil-left), -1.3em) rotate(-80deg);
  background-color: red;
}
.pencil2 {
  transform: translate(var(--pencil-left), -1.3em) rotate(-53.4deg);
  background-color: orange;
}
.pencil3 {
  transform: translate(var(--pencil-left), -1.3em) rotate(-26.6deg);
  background-color: yellow;
}
.pencil4 {
  transform: translate(var(--pencil-left), -1.3em) rotate(-0deg);
  background-color: green;
}
.pencil5 {
  transform: translate(var(--pencil-left), -1.3em) rotate(26.6deg);
  background-color: blue;
}
.pencil6 {
  transform: translate(var(--pencil-left), -1.3em) rotate(53.4deg);
  background-color: black;
}
.pencil7 {
  transform: translate(var(--pencil-left), -1.3em) rotate(80deg);
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
  /* transition: all 0.2s ease-in-out; */
}

.tool-menu {
  left: 0;
  top: 50%;
  opacity: 1;
  width: 13em;
  height: 13em;
  /* overflow: hidden; */
  /* position: fixed; */
  transition: all 0.2s ease-in-out;
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
  transition: all 0.2s ease-in-out;
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
