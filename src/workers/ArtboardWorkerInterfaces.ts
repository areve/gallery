import { setBrush } from "@/components/Brush/brushService";
import type { ColorSpace } from "@/interfaces/BitmapLayer";
import type { ColorCoord } from "@/interfaces/Color";
import type { Coord } from "@/interfaces/Coord";

export interface ArtboardWorker extends Worker {
  postMessage(message: ArtboardWorkerMessage, transfer: Transferable[]): void;
  postMessage(message: ArtboardWorkerMessage, options?: StructuredSerializeOptions): void;
  postMessage(message: ArtboardWorkerMessage3, transfer: Transferable[]): void;
  postMessage(message: ArtboardWorkerMessage3, options?: StructuredSerializeOptions): void;
}

type ActionName = keyof typeof actions extends string ? string : never;
type Action<T> = { name: ActionName; params: T };
type ActionSpecsType<T extends Action<unknown>[]> = T extends ReadonlyArray<infer T1> ? T1 : never;

export type ActionSpec = ActionSpecsType<ActionSpecs>;

export type ActionSpecs = [
  {
    name: "brushService.setBrush";
    params: [color: string, radius: number];
  },
  {
    name: "brushService.haveFun";
    params: [when: string];
  }
];

export const actions = {
  "brushService.setBrush": setBrush,
  "brushService.haveFun": setBrush,
};

export type ArtboardWorkerMessage3 = ActionSpec;

export type ArtboardWorkerMessage =
  | {
      action: "initialize";
      params: {
        offscreenCanvas: OffscreenCanvas;
      };
    }
  | {
      action: "setColorSpace";
      params: {
        colorSpace: ColorSpace;
      };
    }
  | {
      action: "reset";
      params: {
        color: ColorCoord;
      };
    }
  | {
      action: "applyBrush";
      params: {
        fromPoint: Coord | null;
        toPoint: Coord;
        radius: number;
        color: ColorCoord;
        weight: number;
      };
    }
  | {
      action: "setBrush";
      params: {
        color: string;
        radius: number;
      };
    }
  | {
      action: "brushService.setBrush";
      params: [color: string, radius: number];
    }
  | {
      action: "clearCircle";
      params: {
        coord: Coord;
        radius: number;
      };
    };
