<template>
  <section class="gallery-panel">
    <div>GalleryPanel</div>
    <input v-model="artAppState.fileName" />
    <button type="button" @click="save">Save</button>
    <button type="button" @click="load">Load</button>
  </section>
</template>

<script lang="ts" setup>
import { artAppState } from "../ArtApp/artAppState";
import { asBlob } from "../Artboard/artboardService";
import { progressMessage } from "../Progress/progressState";
import { load as galleryLoad, save as gallerySave } from "@/components/Gallery/galleryService";

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
