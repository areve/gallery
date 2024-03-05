<template>
  <div
    class="thumbnail"
    :class="{
      selected: selected,
    }"
    ref="thumbnails"
    :data-id="artwork.id"
    @click="onsselect"
  >
    <img referrerPolicy="no-referrer" class="image" :src="artwork.thumbnailUrl" />
    <div class="name">{{ artwork.name }}</div>

    <div class="buttons">
      <button v-if="selected" type="button" @click="onload">Load</button>
      <button v-if="selected" ref="saveButton" type="button" @click="onsave">Save</button>
      <button v-if="selected" ref="deleteButton" type="button" @click="ondelete">Delete</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Artwork } from "./Artwork";
import { notifyProgress } from "../Notify/notifyState";
import { deleteArtwork, loadArtwork, saveArtwork } from "./galleryService";
import { artAppState } from "../ArtApp/artAppState";
import { asBlob } from "../Artboard/artboardService";

interface Props {
  artwork: Artwork;
  selected: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: "selected", param: Artwork): void;
  (event: "deleted", param: Artwork): void;
}>();

const onsselect = () => emit("selected", props.artwork);
const onsave = async () => {
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

const ondelete = () => {
  notifyProgress("deleting artwork", 1);
  emit("deleted", props.artwork);

  setTimeout(async () => {
    await deleteArtwork({
      name: props.artwork.name,
      path: "/",
    });
    artAppState.value.fileName = "";

    notifyProgress("deleted");
  });
};

const onload = async () => {
  notifyProgress("requesting load", 1);
  await loadArtwork({
    name: props.artwork.name,
    path: "/",
  });
  artAppState.value.fileName = props.artwork.name;
  notifyProgress("loaded");
};
</script>

<style scoped>
.thumbnail {
  position: relative;
  grid-column: span 1;
  margin: 0.1em;
  background-color: #ccc;
  text-align: center;
  overflow: hidden;
  height: 200px;
  transition: height 0.6s ease;
}
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
.filename {
  width: 100%;
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
</style>
