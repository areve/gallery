import { setBrush } from "@/components/Brush/brushService";
import type { ColorSpace } from "@/interfaces/BitmapLayer";
import type { ColorCoord } from "@/interfaces/Color";
import type { Coord } from "@/interfaces/Coord";
import {
  artboardClearCircle,
  artboardWorkerApplyBrush,
  artboardWorkerInitialize,
  artboardWorkerReset,
  artboardWorkerSetColorSpace,
} from "./artboardWorkerService";
import { updateFps } from "@/components/ArtboardPanel/artboardService";

export interface ArtboardWorker extends Worker {
  postMessage(message: ArtboardWorkerMessage3, transfer: Transferable[]): void;
  postMessage(message: ArtboardWorkerMessage3, options?: StructuredSerializeOptions): void;
}

type ActionName = keyof typeof actions;
type Action<T> = { name: ActionName; params: T };
type ActionSpecsType<T extends Action<unknown>[]> = T extends ReadonlyArray<infer T1> ? T1 : never;

export type ActionSpec = ActionSpecsType<ActionSpecs>;

export type ActionSpecs = [
  {
    name: "brushService.setBrush";
    params: [color: string, radius: number];
  },
  {
    name: "initialize";
    params: [offscreenCanvas: OffscreenCanvas];
  },
  {
    name: "setColorSpace";
    params: [colorSpace: ColorSpace];
  },
  {
    name: "reset";
    params: [color: ColorCoord];
  },
  {
    name: "applyBrush";
    params: [brushLastPoint: Coord, canvasPoint: Coord, weight: number, color: ColorCoord, radius: number];
  },
  {
    name: "brushService.setBrush";
    params: [color: string, radius: number];
  },
  {
    name: "clearCircle";
    params: [coord: Coord, radius: number];
  },
  {
    name: "fps";
    params: {
      fps: number;
    };
  }
];

export const actions = {
  initialize: artboardWorkerInitialize,
  setColorSpace: artboardWorkerSetColorSpace,
  reset: artboardWorkerReset,
  applyBrush: artboardWorkerApplyBrush,
  "brushService.setBrush": setBrush,
  clearCircle: artboardClearCircle,
  fps: updateFps,
};

export type ArtboardWorkerMessage3 = ActionSpec;
