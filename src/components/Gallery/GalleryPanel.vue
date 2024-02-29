<template>
  <DockPanel title="Gallery" v-model:panelState="galleryPanelState">
    <div class="thumbnails">
      <div class="thumbnail" v-for="(thumbnail, index) in thumbnails" :key="index">
        <img src="/mocks/image-0-mock.png" />
      </div>
    </div>
    <input v-model="artAppState.fileName" />
    <button type="button" @click="save">Save</button>
    <button type="button" @click="load">Load</button>
  </DockPanel>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { artAppState } from "../ArtApp/artAppState";
import { asBlob } from "../Artboard/artboardService";
import { notifyProgress } from "../Notify/notifyState";
import { load as galleryLoad, save as gallerySave } from "@/components/Gallery/galleryService";
import type { PanelState } from "../DockPanel/PanelState";
import { usePersistentState } from "@/lib/PersistentState";
import DockPanel from "@/components/DockPanel/DockPanel.vue";

const galleryPanelState = ref<PanelState>({
  rolled: true,
});
usePersistentState("galleryPanelState", galleryPanelState);

const thumbnails = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
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

<style scoped>
.thumbnails {
  /* display: flex;
  flex-wrap: wrap; */
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 0em;
  .thumbnail {
    grid-column: span 1;

    /* margin-bottom: 0.2em; */
    /* display: inline-block; */
    /* max-width: 20vmin; */
    /* width: 100%; */
  }
}
</style>
