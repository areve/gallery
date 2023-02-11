import { ref } from "vue";
import { usePersistentState } from "@/services/persistenceService";

export const dragToolState = ref({
  snapSize: 128,
});
usePersistentState("dragToolState", dragToolState)
