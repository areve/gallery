import WebWorker from "@/workers/action-worker?worker";
import type { ActionSpec, ActionWorker } from "@/interfaces/Action";
import { bindMessages } from "@/services/actionService";

let actionWorker: ActionWorker | undefined = undefined;

export const actions: { [k: string]: Function } = {
  example: (a: any) => console.log("example2", a),
};

export function startWorker() {
  actionWorker = createActionWorker();
}

export function stopWorker() {
  actionWorker?.terminate();
  actionWorker = undefined;
}

//TODO make use of getDispatch
export function dispatch(actionSpec: ActionSpec, structuredSerializeOptions?: any[]) {
  if (!actionWorker) return;
  actionWorker.postMessage(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
  return true;
}

function createActionWorker() {
  const worker = new WebWorker() as ActionWorker;
  bindMessages(worker, actions);

  return worker;
}
