import { usePersistentState } from "@/lib/PersistentState";
import { ref } from "vue";

export const artAppState = ref({
  menus: {
    appLeft: false,
    appRight: false,
  },
  fileName: "Hello",
});
usePersistentState("artAppState", artAppState);
