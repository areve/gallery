<template>
  <section title="Gallery">
    <TransitionGroup name="list" tag="div" class="thumbnails">
      <GalleryThumbnail
        v-for="artwork in galleryState.artworks"
        :key="artwork.id"
        :artwork="artwork"
        :data-id="artwork.id"
        :selected="artwork.id === selectedArtwork"
        ref="thumbnails"
        @selected="select"
        @deleted="deleted"
      />
    </TransitionGroup>
    <div class="buttons">
      <button type="button" ref="newButton" @click="startNew">New</button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { artAppState } from "../ArtApp/artAppState";
import { resetCanvas } from "../Artboard/artboardService";
import { newArtwork } from "@/components/Gallery/galleryService";
import type { PanelState } from "../DockPanel/PanelState";
import { usePersistentState } from "@/lib/PersistentState";
import { getAvailableSize } from "@/lib/Window";
import { galleryState } from "./galleryState";
import { v4 as uuid } from "uuid";
import type { Artwork } from "./Artwork";
import GalleryThumbnail from "./GalleryThumbnail.vue";

const thumbnails = ref<any | undefined>();
const newButton = ref<HTMLButtonElement>();

const galleryPanelState = ref<PanelState>({
  rolled: true,
});
usePersistentState("galleryPanelState", galleryPanelState);

const selectedArtwork = ref<string | undefined>();

const select = (artwork: Artwork) => {
  selectedArtwork.value = artwork.id;
};
const deleted = (_artwork: Artwork) => {
  selectedArtwork.value = undefined;
};

const scrollSelectedIntoView = () => {
  if (!thumbnails.value) return;
  const it = thumbnails.value[thumbnails.value.length - 1].$el;
  if (!it) return;
  it.scrollIntoView({
    behavior: "smooth",
  });
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
  // TODO this scroll is jumpy
  setTimeout(scrollSelectedIntoView, 600);
};
</script>

<style scoped>
.thumbnails {
  display: flex;
  flex-direction: column;
}

.buttons {
  position: absolute;
  width: 100%;
  display: flex;
  bottom: 0;
}

.buttons * {
  flex: 1 1;
  margin: 0.1em;
}

.selected {
  box-shadow: 0 0 0.5em 0.5em rgb(0, 127, 255, 0.5);
  z-index: 100;
}

.list-enter-from,
.list-leave-to {
  height: 0;
}
</style>
