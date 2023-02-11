import { ref } from "vue";
import { usePersistentState } from "@/services/persistenceService";

export const toolbarState = ref({
  toolSelected: "pencil",
});
usePersistentState("toolbarState", toolbarState);
