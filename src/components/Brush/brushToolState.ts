import { ref } from "vue";
// import { usePersistentState } from "@/services/persistenceService";

export const brushToolState = ref({
  color: "black",
  radius: 5,
});
// usePersistentState("brushToolState", brushToolState);
