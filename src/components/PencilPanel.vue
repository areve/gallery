<template>
  <div :hidden="!pencilPanelVisible" class="pencil-panel">
    <div class="pencil red"></div>
    <div class="pencil orange"></div>
    <div class="pencil yellow"></div>
    <div class="pencil green selected"></div>
    <div class="pencil blue"></div>
    <div class="pencil purple"></div>
    <div class="pencil black"></div>
    <div class="pencil white"></div>
  </div>
</template>

<script  lang="ts" setup>
import { pencilPanelVisible } from '@/services/editorAppState';

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
  --wood-size: calc(1 - var(--body-size) - var(--tip-size))
}

.pencil-panel {
  position: fixed;
  bottom: 0;
}

.pencil {
  position: relative;
  width: calc(var(--pencil-image-width-px) * var(--scale-factor)); 
  height: calc(var(--pencil-image-height-px) * var(--scale-factor)); 
  display: inline-block;
  background-image: url('@/assets/pencil.png');
  background-size: var(--pencil-width-px); 
  filter: drop-shadow(0px 2px 8px #000c);
  top: calc(120px);
}

.selected {
  top: calc(105px);
}
.pencil::before {
  position: absolute;
  content: '';
  display: block;
  background-image: url('@/assets/pencil.png');
  width: calc(var(--pencil-image-width-px) * var(--scale-factor));
  height: calc(var(--tip-size) * var(--pencil-image-height-px) * var(--scale-factor));
  background-image: url('@/assets/pencil.png');
  background-size: var(--pencil-width-px);
  background-position: 0px 0px;
}

.pencil::after {
  position: absolute;
  content: '';
  display: block;
  width: calc(var(--pencil-image-width-px) * var(--scale-factor));
  height: calc(var(--body-size) * var(--pencil-image-height-px) * var(--scale-factor));
  top: calc((var(--tip-size) + var(--wood-size)) * var(--pencil-image-height-px) * var(--scale-factor));
  background-image: url('@/assets/pencil.png');
  background-size: var(--pencil-width-px);
  background-position: 0px calc(0px - (var(--tip-size) + var(--wood-size)) * var(--pencil-image-height-px) * var(--scale-factor));
}


.pencil.red::before,
.pencil.red::after {
  filter: hue-rotate(325deg)
    brightness(80%)
    saturate(100%)
    contrast(200%);
}

.pencil.orange::before,
.pencil.orange::after {
  filter: hue-rotate(0deg)
    brightness(100%)
    saturate(100%)
    contrast(120%);
}

.pencil.yellow::before,
.pencil.yellow::after {
  filter: hue-rotate(35deg)
    brightness(120%)
    saturate(120%)
    contrast(100%);
}

.pencil.green::before,
.pencil.green::after {
  filter:
    hue-rotate(100deg)
    brightness(90%)
    saturate(100%)
    contrast(180%);
}

.pencil.blue::before,
.pencil.blue::after {
  filter: hue-rotate(190deg) 
    brightness(80%)
    saturate(100%)
    contrast(200%);
}
.pencil.purple::before,
.pencil.purple::after {
  filter: hue-rotate(240deg) 
    brightness(90%)
    saturate(100%)
    contrast(150%);
}

.pencil.black::before,
.pencil.black::after {
  filter: hue-rotate(0deg) 
    brightness(50%)
    saturate(0%)
    contrast(180%);
}

.pencil.white::before,
.pencil.white::after {
  filter: hue-rotate(0deg) 
    brightness(120%)
    saturate(0%)
    contrast(180%);
}

</style>