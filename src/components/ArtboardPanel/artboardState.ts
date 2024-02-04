import type { ColorSpace } from "@/interfaces/BitmapLayer";
import type { ToolType } from "@/interfaces/Tool";
import { ref } from "vue";

export const artboardState = ref({
  selectedTool: "brush" as ToolType,
  colorSpace: "srgb" as ColorSpace,
});
