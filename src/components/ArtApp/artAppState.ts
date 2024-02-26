import { usePersistentState } from "@/lib/PersistentState";
import { ref } from "vue";

export const artAppState = ref({
  menus: {
    appLeft: false,
    appLeft2: false,
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
  edgeButtonStates: {
    left: {
      topPercent: 25,
    },
    right: {
      topPercent: 50,
    },
  },
});
usePersistentState("artAppState", artAppState);
