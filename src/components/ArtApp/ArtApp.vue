<template>
  <div class="show-left-menu-button" @click="showLeftMenu"></div>
  <aside class="left-menu" :hidden="!artAppState.menus.appLeft">
    <ArtAppToolMenu />
  </aside>
  <main class="art-app">
    <ArtboardPanel />
  </main>
  <div class="show-right-menu-button" @click="showRightMenu"></div>
  <aside class="right-menu" :hidden="!artAppState.menus.appRight">
    <ArtAppMainMenu />
  </aside>
</template>

<script lang="ts" setup>
import ArtboardPanel from "@/components/Artboard/ArtboardPanel.vue";
import ArtAppToolMenu from "./ArtAppToolMenu.vue";
import ArtAppMainMenu from "./ArtAppMainMenu.vue";
import { artAppState } from "./artAppState";

document.oncontextmenu = (_: UIEvent) => {
  console.warn("oncontextmenu disabled");
  return false;
};

function showLeftMenu() {
  artAppState.value.menus.appLeft = !artAppState.value.menus.appLeft;
}
function showRightMenu() {
  artAppState.value.menus.appRight = !artAppState.value.menus.appRight;
}
</script>

<style scoped>
.art-app {
  flex: 1 0;
  height: 100%;
  display: flex;
  flex-direction: row;
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
  left: 0;
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
  z-index: 50;
  transition: all 0.2s ease-in-out;
  overflow: hidden;
}

.left-menu[hidden] {
  left: -45%;
  opacity: 0.5;
  display: block !important;
}

.right-menu[hidden] {
  right: -45%;
  opacity: 0;
  display: block !important;
}

.left-menu {
  left: 0;
  opacity: 1;
  width: 45%;
}
.right-menu {
  right: 0;
  opacity: 1;
  width: 45%;
}
</style>
