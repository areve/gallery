import { ref } from "vue";
import { usePersistentState } from "@/services/persistenceService";
import type { PanelState } from "../EditorApp/panelStates";

export const openAiPanelState = ref({
  prompt: "",
  panel: {
    docked: true,
    rolled: false,
    visible: true,
    position: { x: 0, y: 0 },
  } as PanelState,
});

usePersistentState("openAiPanelState", openAiPanelState);
