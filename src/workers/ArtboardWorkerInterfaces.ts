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
  {
    action: setBrush,
    spec: {
      name: "brushService.setBrush" as const,
      params: undefined as never as [color: string, radius: number],
    },
  },
  {
    action: setBrush,
    spec: {
      name: "brushService.haveFun" as const,
      params: undefined as never as [when: string],
    },
  },
];

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer ElementType> ? ElementType : never;

export type ActionsSpec = ElementType<typeof actions>["spec"]; 


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
