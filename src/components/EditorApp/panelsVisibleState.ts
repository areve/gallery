import { usePersistentState } from "@/services/persistenceService";
import { ref } from "vue";

export const panelsVisibleState = ref({
  settings: false,
  gallery: true,
  statusBar: true,
  openAi: true,
  artworkSettings: true,
  scale: true,
  toolbar: true,
  pencil: true,
  menu: true,
});
usePersistentState("panelsVisibleState", panelsVisibleState);
