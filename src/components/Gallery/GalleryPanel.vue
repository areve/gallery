<template>
  <section title="Gallery">
    <div
      class="buttons"
      :style="{
        top: topPercentCss,
      }"
    >
      <input class="filename" type="hidden" v-model="artAppState.fileName" />

      <button class="button" type="button" @click="save">Save</button>
      <button class="button" type="button" @click="deleteSelected">Delete</button>
      <button type="button" @click="loadSelected">Load</button>
      <button type="button" @click="startNew">New</button>
    </div>
    <div class="thumbnails">
      <div
        class="thumbnail"
        :class="{
          selected: isSelected(artwork),
        }"
        v-for="(artwork, index) in galleryState.artworks"
        :key="index"
        ref="thumbnails"
      >
        <img referrerPolicy="no-referrer" @click="select(artwork)" class="image" :src="artwork.thumbnailUrl" />
        <div class="name">{{ artwork.name }}</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { artAppState } from "../ArtApp/artAppState";
import { asBlob, resetCanvas } from "../Artboard/artboardService";
import { notifyProgress } from "../Notify/notifyState";
import { deleteArtwork, loadArtwork, saveArtwork, newArtwork } from "@/components/Gallery/galleryService";
import type { PanelState } from "../DockPanel/PanelState";
import { usePersistentState } from "@/lib/PersistentState";
import { getAvailableSize } from "@/lib/Window";
import { galleryState } from "./galleryState";
import { v4 as uuid } from "uuid";
import type { Artwork } from "./Artwork";

const topPercentCss = computed(() => Math.round(artAppState.value.edgeButtonStates.right.topPercent * 100) / 100 + "%");

const thumbnails = ref<HTMLElement[]>();

const galleryPanelState = ref<PanelState>({
  rolled: true,
});
usePersistentState("galleryPanelState", galleryPanelState);

const selectedArtwork = ref<string | undefined>();
const loadSelected = async () => {
  const selected = galleryState.value.artworks.find((x) => x.id === selectedArtwork.value);
  if (!selected) return;
  load(selected);
};
const isSelected = (artwork: Artwork) => selectedArtwork.value === artwork.id;

const select = (artwork: Artwork) => {
  selectedArtwork.value = artwork.id;
};
const scrollSelectedIntoView = () => {
  const index = galleryState.value.artworks.findIndex((x) => x.id === selectedArtwork.value);

  if (!thumbnails.value) return;
  thumbnails.value[index].scrollIntoView({
    behavior: "smooth",
  });
};

const load = async (artwork: Artwork) => {
  notifyProgress("requesting load", 1);
  await loadArtwork({
    name: artwork.name,
    path: "/",
  });
  artAppState.value.fileName = artwork.name;
  notifyProgress("loaded");
};

const deleteSelected = async () => {
  const selected = galleryState.value.artworks.find((x) => x.id === selectedArtwork.value);
  if (!selected) return;

  notifyProgress("deleting artwork", 1);
  await deleteArtwork({
    name: selected.name,
    path: "/",
  });
  artAppState.value.fileName = "";

  notifyProgress("deleted");
};

const startNew = async () => {
  resetCanvas(getAvailableSize(), "#ffffff");
  const name = new Date().toISOString().replace(/\.\d*/, "").replace(/Z/g, "").replace(/T/g, " ");
  artAppState.value.fileName = name;
  const artwork = {
    name,
    thumbnailUrl: "/mocks/white.png",
    path: "/",
    id: uuid(),
  };
  await newArtwork(artwork);
  select(artwork);
  scrollSelectedIntoView();
};

const save = async () => {
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
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 0em;
  .thumbnail {
    position: relative;
    grid-column: span 1;
    margin: 0.1em;
    background-color: #ccc;
    text-align: center;
    .image {
      cursor: pointer;
      height: 200px;
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
      display: none;
    }
  }
}

.filename {
  width: 100%;
}

.buttons {
  position: fixed;
  right: 11em;
  margin-top: -5em;
  width: 20%;
  z-index: 200;
  * {
    width: 5em;
  }
}

.selected {
  box-shadow: 0 0 0.5em 0.5em rgb(0, 127, 255, 0.5);
  z-index: 100;
}
</style>
