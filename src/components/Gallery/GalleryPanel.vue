<template>
  <DockPanel title="Gallery" v-model:panelState="galleryPanelState">
    <div class="save-buttons">
      <input class="filename" v-model="artAppState.fileName" />
    </div>
    <div class="reset-buttons">
      <button class="button" type="button" @click="save">Save</button>
      <button type="button" @click="load">Load</button>
      <button type="button" @click="newArtwork">New</button>
    </div>
    <div class="thumbnails">
      <div class="thumbnail" v-for="(thumbnail, index) in thumbnails" :key="index">
        <img src="/mocks/image-0-mock.png" />
      </div>
    </div>
  </DockPanel>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { artAppState } from "../ArtApp/artAppState";
import { asBlob, resetCanvas } from "../Artboard/artboardService";
import { notifyProgress } from "../Notify/notifyState";
import { load as galleryLoad, save as gallerySave } from "@/components/Gallery/galleryService";
import type { PanelState } from "../DockPanel/PanelState";
import { usePersistentState } from "@/lib/PersistentState";
import DockPanel from "@/components/DockPanel/DockPanel.vue";
import { getAvailableSize } from "@/lib/Window";

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
const newArtwork = async () => {
  // notifyProgress("requesting load", 1);
  // await galleryLoad({
  //   name: artAppState.value.fileName,
  //   path: "/",
  // });
  // notifyProgress("loaded");
  resetCanvas(getAvailableSize(), "#ffffff");
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
    margin: 0.1em;
    /* margin-bottom: 0.2em; */
    /* display: inline-block; */
    /* max-width: 20vmin; */
    /* width: 100%; */
  }
}
.reset-buttons {
  display: flex;
  * {
    flex: 1 0;
    margin: 0.1em;
  }
}
.save-buttons {
  display: flex;
  * {
    flex: 1 0;
    margin: 0.1em;
  }
}
</style>
