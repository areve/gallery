import type { ToolType } from "@/lib/Tool";
import type { ColorSpace } from "@/lib/BitmapLayer";
import { ref } from "vue";

export const artboardState = ref({
  selectedTool: "brush" as ToolType,
  colorSpace: "oklch" as ColorSpace,
  fps: 0,
});
