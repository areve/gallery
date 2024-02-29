<template>
  <DockPanel title="Gallery" v-model:panelState="galleryPanelState">
    <input class="filename" v-model="artAppState.fileName" />
    <div class="save-buttons">
      <button class="button" type="button" @click="save">Save</button>
    </div>
    <div class="reset-buttons">
      <button type="button" @click="loadGallery2">Load</button>
      <button type="button" @click="newArtwork">New</button>
    </div>
    <div class="thumbnails">
      <div class="thumbnail" v-for="(artwork, index) in galleryState.artworks" :key="index">
        <img referrerPolicy="no-referrer" @click="load(artwork)" class="image" :src="artwork.thumbnailUrl" />
        <div class="name">{{ artwork.name }}</div>
      </div>
    </div>
  </DockPanel>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { artAppState } from "../ArtApp/artAppState";
import { asBlob, resetCanvas } from "../Artboard/artboardService";
import { notifyError, notifyProgress } from "../Notify/notifyState";
import { loadArtwork, loadGallery, saveArtwork } from "@/components/Gallery/galleryService";
import type { PanelState } from "../DockPanel/PanelState";
import { usePersistentState } from "@/lib/PersistentState";
import DockPanel from "@/components/DockPanel/DockPanel.vue";
import { getAvailableSize } from "@/lib/Window";
import { galleryState } from "./galleryState";
import type { Artwork } from "./Artwork";

const galleryPanelState = ref<PanelState>({
  rolled: true,
});
usePersistentState("galleryPanelState", galleryPanelState);

const loadGallery2 = async () => {
  notifyProgress("load gallery", 1);
  try {
    await loadGallery("/");

    notifyProgress("loaded");
  } catch (error: any) {
    notifyError(error);
  }
};

const load = async (artwork: Artwork) => {
  notifyProgress("requesting load", 1);
  await loadArtwork({
    name: artwork.name,
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
  await saveArtwork({
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
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 0em;
  .thumbnail {
    position: relative;
    grid-column: span 1;
    margin: 0.1em;
    /* margin-bottom: 0.2em; */
    /* display: inline-block; */
    /* max-width: 20vmin; */
    /* width: 100%; */
    .image {
      opacity: 0.8;
      cursor: pointer;
    }
    .name {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 0.8em;
      color: #fff;
      background-color: rgb(0, 0, 0, 0.8);
      padding: 0 0.2em;
      margin: 0.1em;
      border-radius: 0.2em;
      line-height: 1.2em;
    }
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
  .button {
    flex: 1 1;
    margin: 0.1em;
    width: 30%;
  }
}
.filename {
  width: 100%;
}
</style>
