import type { RgbaColor } from "@/interfaces/RgbaLayer";
import type { Tool } from "@/interfaces/Tool";
import { brushApply, makeBrush } from "@/lib/rgba/rgba-brush";
import artboardService from "@/components/Artboard/artboardService";
import { brushToolState } from "@/components/Brush/brushToolState";
import Color from "color";
import {
  getCanvasPoint,
  pointerEventsPreventDefault,
  type BasePointerEvent,
} from "../../services/pointerService";

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

function pointerUp(_: BasePointerEvent[]) {
  console.log("brush up");
  pencilLastPoint = null;
  isPointerDown = false;
}
function pointerDown(_: BasePointerEvent[]) {
  console.log("brush down");
  isPointerDown = true;
}

function pointerMove(pointerEvents: BasePointerEvent[]) {
  console.log("brush move");
  if (!isPointerDown) return;
  const pointerEvent = pointerEvents[0];
  pointerEventsPreventDefault(pointerEvents);

  const canvasPoint = getCanvasPoint(
    artboardService.artwork.value.context,
    pointerEvent.page
  );

  const rgbaLayer = artboardService.artwork.value.rgbaLayer;
  if (pencilLastPoint) {
    console.log("brush drag");
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
      colorToRgbaColor(brushToolState.value.brushColor),
      weight
    );
  }

  pencilLastPoint = canvasPoint;
}
