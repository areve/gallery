import { ref } from "vue";
import { usePersistentState } from "@/services/persistenceService";

export const brushToolState = ref({
  brushColor: "black",
});
usePersistentState("brushToolState", brushToolState);
