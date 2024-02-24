<template>
  <EdgeButton
    type="button"
    edge="left"
    class="edge-button"
    @click="showLeftMenu2"
    @longpress="showLeftMenu"
    v-model:edgeButtonState="artAppState.edgeButtonStates.left2"
  ></EdgeButton>
  <EdgeButton type="button" edge="right" class="edge-button" @click="showRightMenu" v-model:edgeButtonState="artAppState.edgeButtonStates.right"></EdgeButton>
  <aside class="left-menu" :hidden="!artAppState.menus.appLeft">
    <ArtAppToolMenu />
  </aside>
  <ArtAppToolMenu2 class="left-menu2" :hidden="!artAppState.menus.appLeft2" />
  <main class="art-app">
    <ProgressPanel />
    <ArtboardPanel />
    <div v-if="artAppState.showFps" class="status-bar">{{ artboardState.fps }}fps {{ artboardState.dimensions }}</div>
  </main>
  <aside class="right-menu" :hidden="!artAppState.menus.appRight">
    <ArtAppMainMenu />
  </aside>
</template>

<script lang="ts" setup>
import ArtboardPanel from "@/components/Artboard/ArtboardPanel.vue";
import ProgressPanel from "@/components/Progress/ProgressPanel.vue";
import EdgeButton from "@/components/EdgeButton/EdgeButton.vue";
import ArtAppToolMenu from "./ArtAppToolMenu.vue";
import ArtAppToolMenu2 from "./ArtAppToolMenu2.vue";
import ArtAppMainMenu from "./ArtAppMainMenu.vue";
import { artAppState } from "./artAppState";
import { artboardState } from "../Artboard/artboardState";

function showLeftMenu() {
  artAppState.value.menus.appLeft = !artAppState.value.menus.appLeft;
}

function showLeftMenu2() {
  artAppState.value.menus.appLeft2 = !artAppState.value.menus.appLeft2;
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
  z-index: 90;
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
  z-index: 50;
  transition: 0.2s ease-in-out;
  transition-property: opacity, left;
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

.status-bar {
  position: fixed;
  bottom: 0;
  left: 0.2em;
  bottom: 0.2em;
  font-size: 0.8em;
  user-select: none;
  background-color: rgb(0, 0, 0, 0.5);
  border-radius: 0.5em;
  padding: 0 0.5em;
  color: white;
}

.edge-button {
  border-radius: 3em;
  z-index: 200;
  width: 6em;
  height: 6em;
  box-shadow: 0em 0em 0.5em rgb(0, 0, 0, 0.8);
  opacity: 0.6;
}
</style>
