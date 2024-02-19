import { usePersistentState } from "@/lib/PersistentState";
import { ref } from "vue";

export const artAppState = ref({
  menus: {
    appLeft: false,
    appRight: false,
  },
  fileName: "Hello",
  showFps: false,
  progress: {
    max: 100,
    value: 32,
    message: "saving",
    error: "something bad happened",
  },
});
usePersistentState("artAppState", artAppState);
