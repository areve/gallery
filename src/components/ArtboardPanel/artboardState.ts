import type { ToolType } from "@/interfaces/Tool";
import { ref } from "vue";

export const artboardState = ref({
  selectedTool: "brush" as ToolType,
});
