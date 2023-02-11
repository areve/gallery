import { ref } from "vue";
import { usePersistentState } from "@/services/persistenceService";

export const scaleToolState = ref({
  scaleImageBy: 0.5,
});
usePersistentState("scaleToolState", scaleToolState);
