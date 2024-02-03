<template>
  <aside class="show-left-menu" @click="showLeftMenu"></aside>
  <main class="art-app">
    <ArtboardPanel />
  </main>
  <aside class="show-right-menu" @click="showRightMenu"></aside>
</template>

<script lang="ts" setup>
import ArtboardPanel from "@/components/ArtboardPanel/ArtboardPanel.vue";
import { swipeEdgeEvent } from "@/services/swipeEdgeService";
import { watchSyncEffect } from "vue";
watchSyncEffect(() => {
  if (!swipeEdgeEvent.value) return;
  console.log("swipeEdgeEvent", swipeEdgeEvent.value);

  if (swipeEdgeEvent.value.edge === "left") {
    //   const red = srgb2oklch(color2srgb("red"));
    //   resetAll(artboardService.artboard.value.bitmapLayer, red);
  } else if (swipeEdgeEvent.value.edge === "right") {
    //   const red = srgb2oklch(color2srgb("green"));
    //   resetAll(artboardService.artboard.value.bitmapLayer, red);
  }
});
function showLeftMenu() {
  console.log("showLeftMenu");
}
function showRightMenu() {
  console.log("showRightMenu");
}
</script>

<style scoped>
.art-app {
  flex: 1 0;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.show-left-menu,
.show-right-menu {
  flex: 0 0;
  background-color: grey;
  min-width: 10px;
  display: block;
  cursor: pointer;
  /* position: relative; */
  /* height: 100%; */
  /* display: flex; */
  /* flex-direction: row; */
}
</style>
