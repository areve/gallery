import { ref } from "vue";
import { usePersistentState } from "../services/persistenceService";

export const eraserToolState = ref({
  eraserSize: 300,
});
usePersistentState("eraserToolState", eraserToolState)
