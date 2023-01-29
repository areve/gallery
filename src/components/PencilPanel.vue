<template>
  <div :hidden="!pencilPanelVisible" class="pencil-panel">
    <div class="pencil red">
      <img src="@/assets/pencil.png" class="pencil-tip"  >
      <img src="@/assets/pencil.png" class="pencil-wood"  >
      <img src="@/assets/pencil.png" class="pencil-body"  >
    </div>
    <div class="pencil green">
      <img src="@/assets/pencil.png" class="pencil-tip"  >
      <img src="@/assets/pencil.png" class="pencil-wood"  >
      <img src="@/assets/pencil.png" class="pencil-body"  >
    </div>
    <div class="pencil blue">
      <img src="@/assets/pencil.png" class="pencil-tip"  >
      <img src="@/assets/pencil.png" class="pencil-wood"  >
      <img src="@/assets/pencil.png" class="pencil-body"  >
    </div>
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
.pencil-tip {
  display: block;
  width: var(--pencil-width);
  height: calc(var(--tip-size) * var(--pencil-image-height) * var(--scale-factor)); 
  object-fit: cover; 
  object-position: 0 0;
}

.pencil-wood {
  display: block;
  width: var(--pencil-width);
  height: calc(var(--wood-size) * var(--pencil-image-height) * var(--scale-factor)); 
  object-fit: cover; 
  object-position: 0 calc(0px - var(--tip-size) * var(--pencil-image-height) * var(--scale-factor));
}

.pencil-body {
  display: block;
  width: var(--pencil-width);
  height: calc(var(--body-size) * var(--pencil-image-height) * var(--scale-factor)); 
  object-fit: cover; 
  object-position: 0 calc(0px - var(--wood-size) * var(--pencil-image-height) * var(--scale-factor) - var(--tip-size) * var(--pencil-image-height) * var(--scale-factor));
}

.pencil {
  display: inline-block
}

.pencil.blue .pencil-tip ,
.pencil.blue .pencil-body { 
  filter: hue-rotate(190deg); 
}


.pencil.red .pencil-tip ,
.pencil.red .pencil-body { 
  filter: hue-rotate(325deg); 
}

.pencil.green .pencil-tip ,
.pencil.green .pencil-body { 
  filter: hue-rotate(100deg); 
}
</style>