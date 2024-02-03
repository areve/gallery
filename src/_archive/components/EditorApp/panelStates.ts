import type { Coord } from "@/interfaces/Coord";
import { usePersistentState } from "@/services/persistenceService";
import { ref } from "vue";

export interface PanelState {
  visible: boolean;
  rolled: boolean;
  docked: boolean;
  position: Coord;
  size?: Coord;
  zIndex: number;
}

// TODO probably move to each panel
export const panelStates = ref<{ [key: string]: PanelState }>({
  settings: {
    visible: false,
    rolled: false,
    docked: true,
    position: { x: 0, y: 0 },
    zIndex: 0,
  },
  gallery: {
    visible: true,
    rolled: false,
    docked: true,
    position: { x: 0, y: 0 },
    zIndex: 0,
  },
  statusBar: {
    visible: true,
    rolled: false,
    docked: true,
    position: { x: 0, y: 0 },
    zIndex: 0,
  },
  artworkSettings: {
    visible: true,
    rolled: false,
    docked: true,
    position: { x: 0, y: 0 },
    zIndex: 0,
  },
  scale: {
    visible: true,
    rolled: false,
    docked: true,
    position: { x: 0, y: 0 },
    zIndex: 0,
  },
  pencil: {
    visible: true,
    rolled: false,
    docked: true,
    position: { x: 0, y: 0 },
    zIndex: 0,
  },
  menu: {
    visible: true,
    rolled: false,
    docked: true,
    position: { x: 0, y: 0 },
    zIndex: 0,
  },
});
usePersistentState("panelStates", panelStates);
