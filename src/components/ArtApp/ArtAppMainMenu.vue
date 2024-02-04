<template>
  <button type="button" @click="reset">Reset</button>
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
import artboardService from "../ArtboardPanel/artboardService";
import { artAppState } from "./artAppState";
import { artboardState } from "@/components/ArtboardPanel/artboardState";

function reset() {
  artboardService.reset();
  artAppState.value.closeMenus();
}
function resetOrange() {
  artboardService.resetOrange();
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
