<template>
  <div
    class="gallery-panel"
    :class="{
      'gallery-tools-visible': true,
    }"
    :hidden="!panelStates.gallery.visible"
  >
    <div class="tools">
      <button class="icon-button" type="button" :disabled="!selectedItem" @click="deleteSelected()">
        <i class="fas fa-trash"></i> <span class="text">Delete</span>
      </button>
      <button class="icon-button" type="button" @click="panelStates.artworkSettings.visible = !panelStates.artworkSettings.visible">
        <i class="fa-solid fa-gear"></i> <span class="text">Settings</span>
      </button>
    </div>
    <ul class="gallery">
      <li
        v-for="item in galleryItems"
        :key="item.id"
        class="gallery-item"
        :class="{
          selected: selectedItem?.id === item.id,
        }"
      >
        <button v-if="item.status === 'waiting'" type="button" class="gallery-button loading">
          <div class="spinner"></div>
          <div class="button-text">{{ mostRecentPrompt(item) }}</div>
        </button>
        <button v-else-if="item.status === 'error'" @click="deleteGalleryItem(item)" type="button" class="gallery-button error">
          <div class="button-text">{{ mostRecentError(item) }}</div>
        </button>
        <button v-else type="button" @click="selectItem(item)" class="gallery-button">
          <img :src="(item as any).dataUrl || '/downloads/' + item.id + '?' + item.modified.toISOString()" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { mostRecentError, mostRecentPrompt } from "@/lib/artwork-utils";
import { deleteGalleryItem, galleryItems, loadGallery, selectedItem } from "@/components/Gallery/galleryService";
import type { Artwork } from "@/interfaces/Artwork";
import { panelStates } from "@/components/EditorApp/panelStates";
import { useGoogleApi } from "./googleApi";

useGoogleApi();

onMounted(async () => {
  await loadGallery();
});

async function deleteSelected() {
  if (!selectedItem.value) return;
  await deleteGalleryItem(selectedItem.value);
  selectedItem.value = null;
}

function selectItem(item: Artwork) {
  if (selectedItem.value === item) {
    selectedItem.value = null;
  } else {
    selectedItem.value = item;
  }
}
</script>

<style scoped>
.spinner {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
}

.spinner:after {
  content: " ";
  display: block;
  width: 80%;
  height: 80%;
  margin: 10%;
  border-radius: 50%;
  border: 0.8em solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: spinner 1.2s linear infinite;
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.gallery-panel {
  padding: 0.4em;
  background-color: #333;
  position: relative;
}

.gallery-tools-visible .gallery {
  margin-top: 3em;
}

.gallery {
  text-align: center;
  list-style: none;
  padding-left: 0;
  display: block;
}

* {
  --gallery-item-width: 100px;
  --gallery-item-selected-border-width: 3px;
}

.gallery-item {
  margin: 3px;
  width: var(--gallery-item-width);
  height: var(--gallery-item-width);
  display: inline-block;
}

.gallery-item.selected {
  box-shadow: 0 0 8px 4px #fff7;
}

.gallery-button {
  width: 100%;
  height: 100%;
  line-height: 1.2em;
  padding: 0;
  border-width: 0;
  border-radius: 0;
  background-color: transparent;
  float: left;
}

.gallery-button.loading {
  color: #666;
}

.gallery-button.error {
  color: red;
}

.button-text {
  width: 100%;
  height: 100%;
  padding: 0.2em;
  overflow: hidden;
}

.gallery-button img {
  max-height: 100%;
  max-width: 100%;
}

.tools {
  display: none;
  position: fixed;
  right: 0;
  top: 0;
  padding: 0.5em;
  margin-right: 2em;
  z-index: 10;
}

.gallery-tools-visible .tools {
  display: block;
  text-align: right;
}

.icon-button .text {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  top: -10000px;
}
</style>
