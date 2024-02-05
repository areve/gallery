import { ref } from "vue";
// import { usePersistentState } from "@/services/persistenceService";

export const brushToolState = ref({
  color: "green",
  radius: 20,
});
// usePersistentState("brushToolState", brushToolState);
