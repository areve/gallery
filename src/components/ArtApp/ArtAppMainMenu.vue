<template>
  <button type="button" @click="resetWhite">Reset</button>
  <button type="button" @click="resetOrange">Reset orange</button>
  <div>
    <strong>Color space</strong>
    <label>
      <input type="radio" name="colorSpace" value="srgb" v-model="artboardState.colorSpace" />
      srgb
    </label>
    <label>
      <input type="radio" name="colorSpace" value="oklch" v-model="artboardState.colorSpace" />
      oklch
    </label>
  </div>
</template>

<script lang="ts" setup>
import { artboardMessageBus } from "@/components/Artboard/Artboard";
import { artAppState } from "./artAppState";
import { artboardState } from "@/components/Artboard/artboardState";
import { color2srgb, colorConverter } from "@/lib/color/color";

function resetWhite() {
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("white"));
  artboardMessageBus.publish({
    name: "resetCanvas",
    params: [color],
  });
  artAppState.value.closeMenus();
}

function resetOrange() {
  const colorConvert = colorConverter("srgb", artboardState.value.colorSpace);
  const color = colorConvert(color2srgb("orange"));
  artboardMessageBus.publish({
    name: "resetCanvas",
    params: [color],
  });
  artAppState.value.closeMenus();
}
</script>

<style scoped>
button {
  border-radius: 0;
  margin: 0;
  display: block;
  width: 100%;
  color: #fff;
  background-color: #666;
}
</style>
