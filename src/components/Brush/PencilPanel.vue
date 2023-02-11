<template>
  <div :hidden="!panelsVisibleState.pencil" class="pencil-panel">
    <div
      class="pencil red"
      @click="(brushToolState.brushColor = '#ff0000'), (toolbarState.toolSelected = 'pencil')"
      :class="{ selected: brushToolState.brushColor === 'red' && toolbarState.toolSelected === 'pencil' }"
    ></div>
    <div
      class="pencil orange"
      @click="(brushToolState.brushColor = 'orange'), (toolbarState.toolSelected = 'pencil')"
      :class="{
        selected: brushToolState.brushColor === 'orange' && toolbarState.toolSelected === 'pencil',
      }"
    ></div>
    <div
      class="pencil yellow"
      @click="(brushToolState.brushColor = 'yellow'), (toolbarState.toolSelected = 'pencil')"
      :class="{
        selected: brushToolState.brushColor === 'yellow' && toolbarState.toolSelected === 'pencil',
      }"
    ></div>
    <div
      class="pencil green"
      @click="(brushToolState.brushColor = 'green'), (toolbarState.toolSelected = 'pencil')"
      :class="{
        selected: brushToolState.brushColor === 'green' && toolbarState.toolSelected === 'pencil',
      }"
    ></div>
    <div
      class="pencil blue"
      @click="(brushToolState.brushColor = 'blue'), (toolbarState.toolSelected = 'pencil')"
      :class="{ selected: brushToolState.brushColor === 'blue' && toolbarState.toolSelected === 'pencil' }"
    ></div>
    <div
      class="pencil purple"
      @click="(brushToolState.brushColor = 'purple'), (toolbarState.toolSelected = 'pencil')"
      :class="{
        selected: brushToolState.brushColor === 'purple' && toolbarState.toolSelected === 'pencil',
      }"
    ></div>
    <div
      class="pencil black"
      @click="(brushToolState.brushColor = 'black'), (toolbarState.toolSelected = 'pencil')"
      :class="{
        selected: brushToolState.brushColor === 'black' && toolbarState.toolSelected === 'pencil',
      }"
    ></div>
    <div
      class="pencil white"
      @click="(brushToolState.brushColor = 'white'), (toolbarState.toolSelected = 'pencil')"
      :class="{
        selected: brushToolState.brushColor === 'white' && toolbarState.toolSelected === 'pencil',
      }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { brushToolState } from './brushToolState';
import { panelsVisibleState } from "@/states/panelsVisibleState"
import { toolbarState } from "@/components/Toolbar/toolbarState";
</script>

<style scoped>
* {
  --pencil-width-n: 30;
  --pencil-image-width-n: 128;
  --pencil-image-width-px: calc(1px * var(--pencil-image-width-n));
  --pencil-image-height-px: 720px;
  --pencil-width-px: calc(1px * var(--pencil-width-n));
  --scale-factor: calc(var(--pencil-width-n) / var(--pencil-image-width-n));

  --tip-size: 0.147;
  --body-size: 0.706;
  --wood-size: calc(1 - var(--body-size) - var(--tip-size));
}

.pencil-panel {
  position: absolute;
  bottom: 0;
  height: 0;
  background-color: red;
}

.pencil {
  position: relative;
  width: calc(var(--pencil-image-width-px) * var(--scale-factor));
  height: calc(var(--pencil-image-height-px) * var(--scale-factor));
  display: inline-block;
  background-image: url("@/assets/pencil.png");
  background-size: var(--pencil-width-px);
  filter: drop-shadow(0px 2px 8px #000c);
  top: -60px;
  cursor: pointer;
}

.selected {
  top: -85px;
}

.pencil::before {
  position: absolute;
  content: "";
  display: block;
  background-image: url("@/assets/pencil.png");
  width: calc(var(--pencil-image-width-px) * var(--scale-factor));
  height: calc(
    var(--tip-size) * var(--pencil-image-height-px) * var(--scale-factor)
  );
  background-image: url("@/assets/pencil.png");
  background-size: var(--pencil-width-px);
  background-position: 0px 0px;
}

.pencil::after {
  position: absolute;
  content: "";
  display: block;
  width: calc(var(--pencil-image-width-px) * var(--scale-factor));
  height: calc(
    var(--body-size) * var(--pencil-image-height-px) * var(--scale-factor)
  );
  top: calc(
    (var(--tip-size) + var(--wood-size)) * var(--pencil-image-height-px) *
      var(--scale-factor)
  );
  background-image: url("@/assets/pencil.png");
  background-size: var(--pencil-width-px);
  background-position: 0px
    calc(
      0px - (var(--tip-size) + var(--wood-size)) * var(--pencil-image-height-px) *
        var(--scale-factor)
    );
}

.pencil.red::before,
.pencil.red::after {
  filter: hue-rotate(325deg) brightness(80%) saturate(100%) contrast(200%);
}

.pencil.orange::before,
.pencil.orange::after {
  filter: hue-rotate(10deg) brightness(100%) saturate(100%) contrast(120%);
}

.pencil.yellow::before,
.pencil.yellow::after {
  filter: hue-rotate(35deg) brightness(140%) saturate(120%) contrast(100%);
}

.pencil.green::before,
.pencil.green::after {
  filter: hue-rotate(100deg) brightness(70%) saturate(100%) contrast(200%);
}

.pencil.blue::before,
.pencil.blue::after {
  filter: hue-rotate(190deg) brightness(63%) saturate(100%) contrast(200%);
}

.pencil.purple::before,
.pencil.purple::after {
  filter: hue-rotate(260deg) brightness(60%) saturate(100%) contrast(200%);
}

.pencil.black::before,
.pencil.black::after {
  filter: hue-rotate(0deg) brightness(50%) saturate(0%) contrast(180%);
}

.pencil.white::before,
.pencil.white::after {
  filter: hue-rotate(0deg) brightness(120%) saturate(0%) contrast(180%);
}
</style>
