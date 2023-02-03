<template>
  <section class="tool-panel" :hidden="!artworkSettingsPanelsVisible">
    <h3>Artwork Settings</h3>
    <textarea class="metadata" v-model="metadataAsJson"></textarea>
    <div>
      <label for="filename">File name</label>
      <input
        type="text"
        class="filename"
        id="filename"
        v-model="artboardService.artwork.value.filename"
      />
    </div>

    <button
      type="button"
      @click="deleteGalleryItem(artboardService.artwork.value)"
    >
      <i class="fas fa-trash"></i> Delete
    </button>
    <button
      type="button"
      @click="saveGalleryItem(artboardService.artwork.value)"
    >
      <i class="fa-solid fa-floppy-disk"></i> Save
    </button>
    <button type="button" @click="artworkSettingsPanelsVisible = false">
      <i class="fa-solid fa-close"></i> Close
    </button>
  </section>
</template>

<script lang="ts" setup>
import artboardService from "@/services/artboardService";
import { artworkSettingsPanelsVisible } from "@/services/editorAppState";
import { deleteGalleryItem, saveGalleryItem } from "@/services/galleryService";
import { computed } from "vue";

const metadataAsJson = computed(() =>
  JSON.stringify(artboardService.artwork.value.metadata)
);
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
