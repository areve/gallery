import type { ColorSpace } from "@/interfaces/BitmapLayer";
import type { ColorCoord } from "@/interfaces/Color";
import type { Coord } from "@/interfaces/Coord";

export interface ArtboardWorker extends Worker {
  postMessage(message: ArtboardWorkerMessage, transfer: Transferable[]): void;
  postMessage(message: ArtboardWorkerMessage, options?: StructuredSerializeOptions): void;
}

// TODO stupid name
export type ArtboardWorkerMessage2 = {
  action: "fps";
  params: {
    fps: number;
  };
};

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
      action: "clearCircle";
      params: {
        coord: Coord;
        radius: number;
      };
    };
