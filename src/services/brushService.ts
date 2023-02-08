import type { Coord } from "@/interfaces/Coord";
import type { RgbaColor, RgbaLayer } from "@/interfaces/RgbaLayer";
import { brushApply, makeBrush } from "@/lib/rgba/rgba-brush";
import Color from "color";
import { brushColor } from "./editorAppState";
import type { CanvasPointerEvent } from "./mouseService";

const radius = 5; // needs to be a integer, I like 5 - 30 is good for debugging colour mixing

const brush = makeBrush(radius);

let pencilLastPoint: { x: number; y: number } | null = null;

export function pencilLift() {
    pencilLastPoint = null
}

export function pencilDrag(
    rgbaLayer: RgbaLayer,
    pointerEvent: CanvasPointerEvent
) {
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
            pointerEvent.canvasPoint,
            brush,
            colorToRgbaColor(brushColor.value),
            weight
        );
    }

    pencilLastPoint = pointerEvent.canvasPoint;
}
