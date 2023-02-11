import type { ToolType } from "@/interfaces/Tool";
import { ref, watch, watchPostEffect, watchSyncEffect, type Ref } from "vue";
import { onAction } from "./appActions";
import artboardService from "./artboardService";
import { usePersistentState, type StateCollection } from "./persistenceService";

//type SerailizedStateCollection = { [key: string]: any };

export const editorAppState = ref({
  toolSelected: "pencil",

  eraserSize: 300,
  snapSize: 128,
  brushColor: "#00ff00",

  settingsPanelVisible: false,
  galleryPanelVisible: true,
  statusBarVisible: true,
  openAiPanelsVisible: true,
  artworkSettingsPanelsVisible: true,
  scalePanelsVisible: true,
  toolbarVisible: true,
  pencilPanelVisible: true,
  menuVisible: true,

  // TODO perhaps these should go to panelState objects?
  prompt: "",
  scaleImageBy: 0.5,

  //artboardServiceState: ref(artboardService.state) // TODO no reset?
});

usePersistentState("editorAppState", editorAppState)

// function resetState() {
//   console.log("resetState");
//   toolSelected.value = "pencil";
//   eraserSize.value = 300;
//   snapSize.value = 128;
//   brushColor.value = "#00ff00";
//   settingsPanelVisible.value = false;
//   galleryPanelVisible.value = true;
//   statusBarVisible.value = true;
//   openAiPanelsVisible.value = true;
//   artworkSettingsPanelsVisible.value = true;
//   scalePanelsVisible.value = true;
//   toolbarVisible.value = true;
//   pencilPanelVisible.value = true;
//   menuVisible.value = true;
//   prompt.value = "";
//   scaleImageBy.value = 0.5;
// }

// export const toolSelected = editorAppState.toolSelected;
// export const eraserSize = editorAppState.eraserSize;
// export const snapSize = editorAppState.snapSize;
// export const brushColor = editorAppState.brushColor;
// export const settingsPanelVisible = editorAppState.settingsPanelVisible;
// export const galleryPanelVisible = editorAppState.galleryPanelVisible;
// export const statusBarVisible = editorAppState.statusBarVisible;
// export const openAiPanelsVisible = editorAppState.openAiPanelsVisible;
// export const artworkSettingsPanelsVisible =
//   editorAppState.artworkSettingsPanelsVisible;
// export const scalePanelsVisible = editorAppState.scalePanelsVisible;
// export const toolbarVisible = editorAppState.toolbarVisible;
// export const pencilPanelVisible = editorAppState.pencilPanelVisible;
// export const menuVisible = editorAppState.menuVisible;
// export const prompt = editorAppState.prompt;
// export const scaleImageBy = editorAppState.scaleImageBy;

// let loaded = false;
// watchPostEffect(() => {
//   if (!loaded) return;
//   const collection: StateCollection = editorAppState;
//   Object.keys(collection).forEach((key) => {
//     void collection[key].value;
//   });

//   saveState();
// });

// loadState();
// function loadState() {
//   console.log("loadState");

//   deserializeStateCollection(
//     editorAppState,
//     window.localStorage.getItem("editorAppState") || "{}"
//   );
//   loaded = true;
// }

// watch(onAction, (action) => {
//   if (action.action === "reset") resetState();
// });

// function saveState() {
//   window.localStorage.setItem(
//     "editorAppState",
//     serializeStateCollection(editorAppState)
//   );
//   console.log("saveState");
// }

// function serializeStateCollection(collection: StateCollection) {
//   const result: SerailizedStateCollection = {};
//   Object.keys(collection).forEach((key) => {
//     result[key] = collection[key].value;
//   });
//   return JSON.stringify(result);
// }

// function deserializeStateCollection(
//   collection: StateCollection,
//   value: string
// ) {
//   const source: SerailizedStateCollection = JSON.parse(value);
//   Object.keys(collection).forEach((key) => {
//     if (source[key] !== undefined) collection[key].value = source[key];
//   });
// }



