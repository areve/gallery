import { ref } from "vue";
// import { usePersistentState } from "@/services/persistenceService";

export const brushToolState = ref({
  color: "black",
  radius: 100,
});
// usePersistentState("brushToolState", brushToolState);
