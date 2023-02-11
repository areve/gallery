import { ref } from "vue";
import { usePersistentState } from "@/services/persistenceService";

export const brushToolState = ref({
  brushColor: "#00ff00",
});
usePersistentState("brushToolState", brushToolState)
