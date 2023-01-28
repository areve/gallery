<template>
  <section class="tool-panel" :hidden="!formPanelsVisible">
    <h3>Artwork Settings</h3>
    <button type="button" @click="showMetadata = !showMetadata">Toggle Metadata</button>
    <textarea class="metadata" v-model="metadataAsJson" :hidden="!showMetadata"></textarea>
    <input type="text" v-model="artboardService.artwork.value.filename" />
    <button type="button" @click="deleteGalleryItem(artboardService.artwork.value)">Delete</button>
  </section>
</template>

<script  lang="ts" setup>

import artboardService from '@/services/artboardService';
import { formPanelsVisible, showMetadata } from '@/services/editorAppState';
import { deleteGalleryItem } from '@/services/galleryService';
import { computed } from 'vue';

const metadataAsJson = computed(() => JSON.stringify(artboardService.artwork.value.metadata))

</script>

<style scoped>

.metadata {
  width: 100%;
  height: 9.6em;
  resize: none;
}
</style>