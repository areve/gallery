<template>
  <div class="show-left-menu-button" @click="showLeftMenu" :hidden="menuState.showLeftMenu"></div>
  <div class="show-right-menu-button" @click="showRightMenu" :hidden="menuState.showRightMenu"></div>
  <div class="cancel-overlay" @click="cancelMenus" :hidden="!menuState.showLeftMenu && !menuState.showRightMenu"></div>
  <aside class="left-menu" :hidden="!menuState.showLeftMenu">left menu</aside>
  <main class="art-app">
    <ArtboardPanel />
  </main>
  <aside class="right-menu" :hidden="!menuState.showRightMenu">right menu</aside>
</template>

<script lang="ts" setup>
import ArtboardPanel from "@/components/ArtboardPanel/ArtboardPanel.vue";
import { swipeEdgeEvent } from "@/services/swipeEdgeService";
import { ref, watchSyncEffect } from "vue";

const menuState = ref({
  showLeftMenu: false,
  showRightMenu: false,
});
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
  menuState.value.showLeftMenu = false;
  menuState.value.showRightMenu = false;
  console.log("cancelMenus");
}
function showLeftMenu() {
  menuState.value.showLeftMenu = true;
}
function showRightMenu() {
  menuState.value.showRightMenu = true;
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
  width: 45%;
  height: 100%;
  background-color: rgb(127, 127, 127, 0.95);
  cursor: pointer;
  z-index: 100;
}

.right-menu {
  right: 0;
}
</style>
