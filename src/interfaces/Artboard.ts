import type { ArtboardWorker } from "@/workers/ArtboardWorkerInterfaces";

export interface Artboard {
  canvas?: HTMLCanvasElement;
  worker?: ArtboardWorker;
}
