<template>
  <EdgeButton
    type="button"
    edge="left"
    class="edge-button"
    @click="showLeftMenu"
    @contextmenu="showLeftExtendedMenu"
    v-model:edgeButtonState="artAppState.edgeButtonStates.left"
  ></EdgeButton>
  <EdgeButton
    type="button"
    edge="right"
    class="edge-button"
    @click="showRightMenu"
    @contextmenu="showRightExtendedMenu"
    v-model:edgeButtonState="artAppState.edgeButtonStates.right"
  ></EdgeButton>
  <ArtAppToolMenu :hidden="!artAppState.menus.appLeft" />
  <ArtAppToolMenuExtended :hidden="!artAppState.menus.appLeftExtended" />
  <main class="art-app">
    <NotifyPanel />
    <ArtboardPanel />
    <div v-if="artAppState.showFps" class="status-bar">{{ artboardState.fps }}fps {{ artboardState.dimensions }}</div>
  </main>
  <ArtAppMainMenu :hidden="!artAppState.menus.appRight" />
  <ArtAppMainMenuExtended :hidden="!artAppState.menus.appRightExtended" />
</template>

<script lang="ts" setup>
import ArtboardPanel from "@/components/Artboard/ArtboardPanel.vue";
import NotifyPanel from "@/components/Notify/NotifyPanel.vue";
import EdgeButton from "@/components/EdgeButton/EdgeButton.vue";
import ArtAppToolMenu from "./ArtAppToolMenu.vue";
import ArtAppToolMenuExtended from "./ArtAppToolMenuExtended.vue";
import ArtAppMainMenu from "./ArtAppMainMenu.vue";
import ArtAppMainMenuExtended from "./ArtAppMainMenuExtended.vue";
import { artAppState } from "./artAppState";
import { artboardState } from "../Artboard/artboardState";

function showLeftMenu() {
  artAppState.value.menus.appLeft = !artAppState.value.menus.appLeft;
}

function showLeftExtendedMenu() {
  artAppState.value.menus.appLeftExtended = !artAppState.value.menus.appLeftExtended;
}

function showRightMenu() {
  artAppState.value.menus.appRight = !artAppState.value.menus.appRight;
}

function showRightExtendedMenu() {
  artAppState.value.menus.appRightExtended = !artAppState.value.menus.appRightExtended;
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
