import type { RgbaColor } from "@/interfaces/RgbaLayer";
import type { Tool } from "@/interfaces/Tool";
import { brushApply, makeBrush } from "@/lib/rgba/rgba-brush";
import artboardService from "@/components/Artboard/artboardService";
import { brushToolState } from "@/components/Brush/brushToolState";
import Color from "color";
import { getCanvasPoint } from "../../services/pointerService";

const tool: Tool = {
  toolType: "pencil",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useBrushTool = () => tool;

const radius = 3;

const brush = makeBrush(radius);

let pencilLastPoint: { x: number; y: number } | null = null;
let isPointerDown = false;

function pointerUp(_: PointerEvent) {
  console.log("brush up");
  pencilLastPoint = null;
  isPointerDown = false;
}
function pointerDown(_: PointerEvent) {
  console.log("brush down");
  isPointerDown = true;
}

function pointerMove(pointerEvent: PointerEvent) {
  if (!isPointerDown) return;

  const canvasPoint = getCanvasPoint(artboardService.artwork.value.context, {
    x: pointerEvent.pageX,
    y: pointerEvent.pageY,
  });

  const rgbaLayer = artboardService.artwork.value.rgbaLayer;
  if (pencilLastPoint) {
    let weight = pointerEvent.pressure ?? 0.5;
    weight = weight * weight;

    const colorToRgbaColor = (value: string) => {
      const color = Color(value);
      const { r, g, b, a } = color.object();
      return [r / 255, g / 255, b / 255, a === undefined ? 1 : a / 255] as RgbaColor;
    };

    brushApply(rgbaLayer, pencilLastPoint, canvasPoint, brush, colorToRgbaColor(brushToolState.value.brushColor), weight);
  }

  pencilLastPoint = canvasPoint;
}
