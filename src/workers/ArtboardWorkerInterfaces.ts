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

// TODO stupid name
export type ArtboardWorkerMessage2 = {
  action: "fps";
  params: {
    fps: number;
  };
};

export const actions = [
  [
    "brushService.setBrush" as const, //
    undefined as never as [color: string, radius: number],
    setBrush,
  ],
  [
    "brushService.haveFun" as const, //
    undefined as never as [when: string],
    setBrush,
  ],
];

//const values = ['A', 'B'] as const
type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer ElementType> ? ElementType : never;

export type ActionsSpec = ElementType<typeof actions>; // this is correctly inferred as literal "A" | "B"

// export type Actions = typeof actions;
// export type ActionName = of Actions;
// export type ActionSpec = Actions[ActionName];
// export type ActionSpecParams = ActionSpec["spec"];

export type ArtboardWorkerMessage3 = ActionsSpec;

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
