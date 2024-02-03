<template>
  <AppWindow title="Artwork" v-model:panelState="panelStates.artworkSettings">
    <textarea class="metadata" v-model="metadataAsJson"></textarea>
    <div>
      <label for="id">Id</label>
      <input type="text" class="id" id="id" v-model="artboardService.artwork.value.id" />
    </div>
    <div>
      <label for="name">Name</label>
      <input type="text" class="name" id="name" v-model="artboardService.artwork.value.name" />
    </div>
    <div>
      <button type="button" @click="deleteGalleryItem(artboardService.artwork.value)"><i class="fas fa-trash"></i> Delete</button>
      <button type="button" @click="saveGalleryItem(artboardService.artwork.value)"><i class="fa-solid fa-floppy-disk"></i> Save</button>
    </div>
  </AppWindow>
</template>

<script lang="ts" setup>
import artboardService from "@/components/Artboard/artboardService";
import { panelStates } from "@/components/EditorApp/panelStates";
import { deleteGalleryItem, saveGalleryItem } from "@/components/Gallery/galleryService";
import { computed } from "vue";
import AppWindow from "../AppWindow/AppWindow.vue";

const metadataAsJson = computed({
  get: () => JSON.stringify(artboardService.artwork.value.metadata),
  set: (value) => (artboardService.artwork.value.metadata = JSON.parse(value)),
});
</script>

<style scoped>
.id {
  width: 100%;
}
.name {
  width: 100%;
}

.metadata {
  width: 100%;
  resize: none;
  flex: 1 0;
}
</style>
