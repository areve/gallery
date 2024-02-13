import type { Coord } from "@/lib/Coord";
import type { ToolType } from "@/lib/Tool";
import type { ColorSpace } from "@/lib/BitmapLayer";
import { ref } from "vue";

export const artboardState = ref({
  selectedTool: "brush" as ToolType,
  colorSpace: "oklch" as ColorSpace,
  dimensions: { x: 1024, y: 1024 } as Coord,
  fps: 0,
});
