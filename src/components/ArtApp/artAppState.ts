import { usePersistentState } from "@/lib/PersistentState";
import { ref } from "vue";

export const artAppState = ref({
  menus: {
    appLeft: false,
    appRight: false,
  },
  fileName: "Hello",
  showFps: false,
});
usePersistentState("artAppState", artAppState);
