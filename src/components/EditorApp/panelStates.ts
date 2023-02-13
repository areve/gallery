import { usePersistentState } from "@/services/persistenceService";
import { ref } from "vue";

export interface PanelState {
  visible: boolean;
  rolled: boolean;
  docked: boolean;
}

// TODO probably move to each panel
export const panelStates = ref<{ [key: string]: PanelState }>({
  settings: {
    visible: false,
    rolled: false,
    docked: true,
  },
  gallery: {
    visible: true,
    rolled: false,
    docked: true,
  },
  statusBar: {
    visible: true,
    rolled: false,
    docked: true,
  },
  openAi: {
    visible: true,
    rolled: false,
    docked: true,
  },
  artworkSettings: {
    visible: true,
    rolled: false,
    docked: true,
  },
  scale: {
    visible: true,
    rolled: false,
    docked: true,
  },
  toolbar: {
    visible: true,
    rolled: false,
    docked: true,
  },
  pencil: {
    visible: true,
    rolled: false,
    docked: true,
  },
  menu: {
    visible: true,
    rolled: false,
    docked: true,
  },
});
usePersistentState("panelStates", panelStates);
