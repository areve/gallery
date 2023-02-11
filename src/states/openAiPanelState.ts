import { ref } from "vue";
import { usePersistentState } from "@/services/persistenceService";

export const openAiPanelState = ref({
  prompt: "",
});
usePersistentState("openAiPanelState", openAiPanelState)
