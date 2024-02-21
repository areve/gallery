<template>
  <section class="artboard-reset-panel">
    <div>artboard-reset-panel</div>
    <div class="reset-dimensions">
      <div>color and dimensions</div>
      <input type="color" v-model="resetColor" />
      <input type="number" v-model="resetDimensions.x" class="dimension" min="1" max="5120" />
      x
      <input type="number" v-model="resetDimensions.y" class="dimension" min="1" max="5120" />
    </div>
    <div>
      <button type="button" @click="sizeFromAvailable">Size from available</button>
      <button type="button" @click="resetToColor">Reset to colour</button>
      <button type="button" @click="resetToTransparent">Reset to transparent</button>
    </div>

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
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { resetCanvas } from "./artboardService";
import { clone } from "@/lib/utils";
import type { Coord } from "@/lib/Coord";
import { getAvailableSize } from "@/lib/Window";
import { artboardState } from "./artboardState";

const resetColor = ref<string>("#ffffff");
const resetToColor = () => resetCanvas(clone(resetDimensions.value), resetColor.value);
const resetToTransparent = () => resetCanvas(clone(resetDimensions.value), "transparent");
const sizeFromAvailable = () => (resetDimensions.value = getAvailableSize());
const resetDimensions = ref<Coord>(getAvailableSize());
</script>

<style scoped>
.dimension {
  width: 4em;
}
</style>
