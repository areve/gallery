import Worker from "@/workers/worker?worker";
import { actions, type ActionSpec, type ArtboardWorkerMessage3 } from "@/workers/ArtboardWorkerInterfaces";
import type { ArtboardWorker } from "@/workers/ArtboardWorkerInterfaces";

// TODO is it an ArtboardWorker? or not
let worker: ArtboardWorker | undefined = undefined;

export function startWorker() {
  worker = new Worker() as ArtboardWorker;
  //worker.onmessage = (event: MessageEvent<ArtboardWorkerMessage3>) => {
  // if (event.data.name === "fps") {
  //   artboardState.value.fps = event.data.params.fps;
  // }
  worker.onmessage = function (event: MessageEvent<ArtboardWorkerMessage3>) {
    const fn: Function = actions[event.data.name];
    if (fn) {
      fn(...event.data.params);
      return;
    }
  };
}

export function stopWorker() {
  worker?.terminate();
  worker = undefined;
}

export function dispatch(actionSpec: ActionSpec, structuredSerializeOptions?: any[]) {
  if (!worker) return;
  worker.postMessage(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
  return true;
}
