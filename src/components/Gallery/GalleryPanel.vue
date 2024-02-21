<template>
  <RollupPanel title="Gallery" v-model:panelState="galleryPanelState">
    <section class="gallery-panel">
      <div>GalleryPanel</div>
      <input v-model="artAppState.fileName" />
      <button type="button" @click="save">Save</button>
      <button type="button" @click="load">Load</button>
    </section>
  </RollupPanel>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { artAppState } from "../ArtApp/artAppState";
import { asBlob } from "../Artboard/artboardService";
import { progressMessage } from "../Progress/progressState";
import { load as galleryLoad, save as gallerySave } from "@/components/Gallery/galleryService";
import type { PanelState } from "../RollupPanel/PanelState";
import { usePersistentState } from "@/lib/PersistentState";
import RollupPanel from "@/components/RollupPanel/RollupPanel.vue";

const galleryPanelState = ref<PanelState>({
  rolled: true,
});
usePersistentState("galleryPanelState", galleryPanelState);

const load = async () => {
  progressMessage("requesting load", 5);
  await galleryLoad({
    name: artAppState.value.fileName,
    path: "/",
  });
};

const save = async () => {
  // TODO if it exists indicate it when I choose the name
  // TODO add a way to browse images
  progressMessage("converting canvas to blob", 6);
  const blob = await asBlob();

  progressMessage("saving blob");
  await gallerySave({
    blob,
    name: artAppState.value.fileName,
    path: "/",
  });
};
</script>

<style scoped></style>
