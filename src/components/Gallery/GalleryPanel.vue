<template>
  <RollupPanel title="Gallery" v-model:panelState="galleryPanelState">
    <input v-model="artAppState.fileName" />
    <button type="button" @click="save">Save</button>
    <button type="button" @click="load">Load</button>
  </RollupPanel>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { artAppState } from "../ArtApp/artAppState";
import { asBlob } from "../Artboard/artboardService";
import { notifyProgress } from "../Notify/notifyState";
import { load as galleryLoad, save as gallerySave } from "@/components/Gallery/galleryService";
import type { PanelState } from "../RollupPanel/PanelState";
import { usePersistentState } from "@/lib/PersistentState";
import RollupPanel from "@/components/RollupPanel/RollupPanel.vue";

const galleryPanelState = ref<PanelState>({
  rolled: true,
});
usePersistentState("galleryPanelState", galleryPanelState);

const load = async () => {
  notifyProgress("requesting load", 1);
  await galleryLoad({
    name: artAppState.value.fileName,
    path: "/",
  });
  notifyProgress("loaded");
};

const save = async () => {
  // TODO if it exists indicate it when I choose the name
  // TODO add a way to browse images
  notifyProgress("converting canvas to blob", 2);
  const blob = await asBlob();

  notifyProgress("saving blob");
  await gallerySave({
    blob,
    name: artAppState.value.fileName,
    path: "/",
  });
  notifyProgress("blob saved");
};
</script>

<style scoped></style>
../Notify/progressState