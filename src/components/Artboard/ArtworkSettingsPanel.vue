<template>
  <AppWindow title="Artwork Settings" v-model:panelState="panelStates.artworkSettings">
    <textarea class="metadata" v-model="metadataAsJson"></textarea>
    <div>
      <label for="filename">File name</label>
      <input type="text" class="filename" id="filename" v-model="artboardService.artwork.value.filename" />
    </div>

    <button type="button" @click="deleteGalleryItem(artboardService.artwork.value)"><i class="fas fa-trash"></i> Delete</button>
    <button type="button" @click="saveGalleryItem(artboardService.artwork.value)"><i class="fa-solid fa-floppy-disk"></i> Save</button>
  </AppWindow>
</template>

<script lang="ts" setup>
import artboardService from "@/components/Artboard/artboardService";
import { panelStates } from "@/components/EditorApp/panelStates";
import { deleteGalleryItem, saveGalleryItem } from "@/components/Gallery/galleryService";
import { computed } from "vue";
import AppWindow from "../AppWindow/AppWindow.vue";

const metadataAsJson = computed(() => JSON.stringify(artboardService.artwork.value.metadata));
</script>

<style scoped>
.filename {
  width: 100%;
}
.metadata {
  width: 100%;
  height: 9.6em;
  resize: none;
}
</style>
