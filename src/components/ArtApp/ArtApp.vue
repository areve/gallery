<template>
  <div class="show-left-menu-button" @click="showLeftMenu" :hidden="artAppState.showLeftMenu"></div>
  <div class="cancel-overlay" @click="cancelMenus" :hidden="!artAppState.showLeftMenu && !artAppState.showRightMenu"></div>
  <aside class="left-menu" :hidden="!artAppState.showLeftMenu">
    <ArtAppToolMenu />
  </aside>
  <main class="art-app">
    <ArtboardPanel />
  </main>
  <div class="show-right-menu-button" @click="showRightMenu" :hidden="artAppState.showRightMenu"></div>
  <aside class="right-menu" :hidden="!artAppState.showRightMenu">
    <ArtAppMainMenu />
  </aside>
</template>

<script lang="ts" setup>
import ArtboardPanel from "@/components/ArtboardPanel/ArtboardPanel.vue";
import ArtAppToolMenu from "./ArtAppToolMenu.vue";
import ArtAppMainMenu from "./ArtAppMainMenu.vue";
import { swipeEdgeEvent } from "@/services/swipeEdgeService";
import { watchSyncEffect } from "vue";
import { artAppState } from "./artAppState";

watchSyncEffect(() => {
  if (!swipeEdgeEvent.value) return;
  console.log("swipeEdgeEvent", swipeEdgeEvent.value);

  if (swipeEdgeEvent.value.edge === "left") {
    showLeftMenu();
  } else if (swipeEdgeEvent.value.edge === "right") {
    showRightMenu();
  }
});
function cancelMenus() {
  artAppState.value.showLeftMenu = false;
  artAppState.value.showRightMenu = false;
  console.log("cancelMenus");
}
function showLeftMenu() {
  artAppState.value.showLeftMenu = true;
}
function showRightMenu() {
  artAppState.value.showRightMenu = true;
}
</script>

<style scoped>
.art-app {
  flex: 1 0;
  position: fixed;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.cancel-overlay {
  display: fixed;
  width: 100%;
  height: 100%;
  z-index: 99;
  cursor: pointer;
  background-color: rgb(127, 127, 127, 0.1);
}

.show-left-menu-button,
.show-right-menu-button {
  position: fixed;
  width: 3em;
  height: 3em;
  background-color: rgb(127, 127, 127, 0.5);
  cursor: pointer;
  z-index: 100;
}

.show-left-menu-button {
  border-bottom-right-radius: 3em;
}
.show-right-menu-button {
  border-bottom-left-radius: 3em;
  right: 0;
}

.left-menu,
.right-menu {
  position: fixed;
  width: 20%;
  height: 100%;
  background-color: rgb(127, 127, 127, 0.95);
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s ease-in-out;
  overflow: hidden;
}

.right-menu[hidden],
.left-menu[hidden] {
  width: 0%;
  opacity: 0;
  display: block !important;
}

.left-menu {
  opacity: 1;
  width: 45%;
}
.right-menu {
  right: 0;
  opacity: 1;
  width: 45%;
}
</style>
