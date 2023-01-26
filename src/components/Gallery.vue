<template>
<ul class="gallery">
        <li v-for="item in galleryItems" class="gallery-item">
          <button v-if="item.status === 'waiting'" type="button" class="loading-button">{{ mostRecentPrompt(item) }}<div
              class="spinner"></div></button>
          <button v-else-if="item.status === 'error'" type="button" class="error-button">{{
            mostRecentError(item)
          }}</button>
          <button v-else type="button" @click="selectItem(item)" class="gallery-button"><img
              :src="(item as any).dataUrl || '/downloads/' + item.filename" /></button>
        </li>
      </ul>
</template>

<script  lang="ts" setup>
import { onMounted, ref } from 'vue';
import { mostRecentError, mostRecentPrompt } from '@/lib/utils'
import { galleryItems, loadGallery, selectedItem } from '@/services/galleryService';
import type { Artwork } from '@/interfaces/Artwork';

onMounted(async () => {
  await loadGallery()
})

function selectItem(item: Artwork){
  selectedItem.value = item
}
</script>

<style scoped>

.spinner {
  position: absolute;
  left: 50%;
  padding-top: calc(50% - 60px);
  width: 80px;
  height: 80px;
  margin-left: -40px;
  margin-top: -40px;
}

.spinner:after {
  content: " ";
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #fff;
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

.gallery {
  list-style: none;
  padding-left: 0;
  display: block;
}

.gallery-item {
  margin: 2px;
  width: 100px;
  height: 100px;
  display: inline-block;
}

.loading-button {
  width: 100px;
  height: 100px;
  color: #666;
  line-height: 1.2em;
  vertical-align: top;
}

.loading-button .spinner {
  margin-top: -70px
}

.error-button {
  width: 100px;
  height: 100px;
  color: red;
  line-height: 1.2em;
  vertical-align: top;
}

.gallery-button {
  width: 100px;
  height: 100px;
  padding: 2px;
  vertical-align: top;
  overflow: hidden;
}
.gallery-button img {
  max-height: 100%;
}
</style>