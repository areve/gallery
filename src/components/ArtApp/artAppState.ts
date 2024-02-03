import type { ToolType } from "@/interfaces/Tool";
import { ref } from "vue";

export const artAppState = ref({
  menus: {
    appLeft: false,
    appRight: false,
  },
  selectedTool: "brush" as ToolType,
  closeMenus() {
    artAppState.value.menus.appLeft = false;
    artAppState.value.menus.appRight = false;
  },
});
