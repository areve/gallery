import type { RgbaColor } from "@/interfaces/RgbaLayer";
import type { Tool } from "@/interfaces/Tool";
import { brushApply, makeBrush } from "@/lib/rgba/rgba-brush";
import artboardService from "@/services/artboardService";
import Color from "color";
import { brushColor } from "../services/editorAppState";
import { getCanvasPoint, pointerEventsPreventDefault, type BasePointerEvent } from "../services/pointerService";


const tool: Tool = {
  toolType: "pencil",
  pointerUp,
  pointerDown,
  pointerMove,
}

export const useBrushTool = () => tool

const radius = 5; // needs to be a integer, I like 5 - 30 is good for debugging colour mixing

const brush = makeBrush(radius);

let pencilLastPoint: { x: number; y: number } | null = null;
let isPointerDown = false

function pointerUp(pointerEvents: BasePointerEvent[]) {
  pencilLastPoint = null;
  isPointerDown = false
}
function pointerDown(pointerEvents: BasePointerEvent[]) {
  isPointerDown = true
}

function pointerMove(pointerEvents: BasePointerEvent[]) {
  if (!isPointerDown) return
  const pointerEvent = pointerEvents[0];
  pointerEventsPreventDefault(pointerEvents)

  const canvasPoint = getCanvasPoint(artboardService.artwork.value.context, pointerEvent.point)
  const rgbaLayer = artboardService.artwork.value.rgbaLayer
  if (pencilLastPoint) {
    let weight = pointerEvent.force ?? 0.5;
    weight = weight * weight;

    const colorToRgbaColor = (value: string) => {
      const color = Color(value);
      const { r, g, b, a } = color.object();
      return [
        r / 255,
        g / 255,
        b / 255,
        a === undefined ? 1 : a / 255,
      ] as RgbaColor;
    };

    brushApply(
      rgbaLayer,
      pencilLastPoint,
      canvasPoint,
      brush,
      colorToRgbaColor(brushColor.value),
      weight
    );
  }

  pencilLastPoint = canvasPoint;
}
