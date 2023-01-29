<template>
  <div :hidden="!pencilPanelVisible" class="pencil-panel">

    <div class="pencil red"></div>
    <div class="pencil green"></div>
    <div class="pencil blue"></div>
  </div>
</template>

<script  lang="ts" setup>
import { pencilPanelVisible } from '@/services/editorAppState';

</script>

<style scoped>
* {
  --pencil-image-width: 128px;
  --pencil-image-height: 720px;
  --pencil-width: 50px;
  --scale-factor: 50 / 128;

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
  width: calc(var(--pencil-image-width) * var(--scale-factor)); 
  height: calc(var(--pencil-image-height) * var(--scale-factor)); 
  display: inline-block;
  background-image: url('@/assets/pencil.png');
  background-size: var(--pencil-width);  
}

.pencil::before {
  position: absolute;
  content: '';
  display: block;
  background-image: url('@/assets/pencil.png');
  width: calc(var(--pencil-image-width) * var(--scale-factor));
  height: calc(var(--tip-size) * var(--pencil-image-height) * var(--scale-factor));
  background-image: url('@/assets/pencil.png');
  background-size: var(--pencil-width);
  background-position: 0px 0px;
}

.pencil::after {
  position: absolute;
  content: '';
  display: block;
  width: calc(var(--pencil-image-width) * var(--scale-factor));
  height: calc(var(--body-size) * var(--pencil-image-height) * var(--scale-factor));
  top: calc((var(--tip-size) + var(--wood-size)) * var(--pencil-image-height) * var(--scale-factor));
  background-image: url('@/assets/pencil.png');
  background-size: var(--pencil-width);
  background-position: 0px calc(0px - (var(--tip-size) + var(--wood-size)) * var(--pencil-image-height) * var(--scale-factor));
}


.pencil.blue::before,
.pencil.blue::after {
  filter: hue-rotate(190deg);
}

.pencil.red::before,
.pencil.red::after {
  filter: hue-rotate(325deg);
}

.pencil.green::before,
.pencil.green::after {
  filter: hue-rotate(100deg);
}
</style>