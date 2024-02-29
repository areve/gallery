<template>
  <DockPanel title="Artboard reset" v-model:panelState="artboardResetPanelState">
    <div class="reset-dimensions">
      <div>Color and dimensions</div>
      <input type="color" v-model="resetColor" />
      <input type="number" v-model="resetDimensions.x" class="dimension" min="1" max="5120" />
      x
      <input type="number" v-model="resetDimensions.y" class="dimension" min="1" max="5120" />
    </div>
    <button type="button" @click="sizeFromAvailable">Size from available</button>
    <button type="button" @click="resetToColor">Reset to colour</button>
    <button type="button" @click="resetToTransparent">Reset to transparent</button>

    <div>Color space</div>
    <div>
      <label>
        <input type="radio" name="colorSpace" value="srgb" v-model="artboardState.colorSpace" />
        srgb
      </label>
      <label>
        <input type="radio" name="colorSpace" value="oklch" v-model="artboardState.colorSpace" />
        oklch
      </label>
    </div>
  </DockPanel>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { resetCanvas } from "./artboardService";
import { clone } from "@/lib/utils";
import type { Coord } from "@/lib/Coord";
import { getAvailableSize } from "@/lib/Window";
import { artboardState } from "./artboardState";
import DockPanel from "@/components/DockPanel/DockPanel.vue";
import type { PanelState } from "../DockPanel/PanelState";
import { usePersistentState } from "@/lib/PersistentState";

const resetColor = ref<string>("#ffffff");
const resetToColor = () => resetCanvas(clone(resetDimensions.value), resetColor.value);
const resetToTransparent = () => resetCanvas(clone(resetDimensions.value), "transparent");
const sizeFromAvailable = () => (resetDimensions.value = getAvailableSize());
const resetDimensions = ref<Coord>(getAvailableSize());

const artboardResetPanelState = ref<PanelState>({
  rolled: true,
});
usePersistentState("artboardResetPanelState", artboardResetPanelState);
</script>

<style scoped>
.dimension {
  width: 4em;
}
</style>
