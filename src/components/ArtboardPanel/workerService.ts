import WebWorker from "@/workers/action-worker?worker";
import type { ActionSpec, ActionWorker } from "@/workers/ActionSpec";

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

export function dispatch(actionSpec: ActionSpec, structuredSerializeOptions?: any[]) {
  if (!actionWorker) return;
  actionWorker.postMessage(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
  return true;
}

function createActionWorker() {
  const worker = new WebWorker() as ActionWorker;
  worker.onmessage = function (event: MessageEvent<ActionSpec>) {
    const action: Function = actions[event.data.name];
    if (!action) throw `action not found: ${event.data.name}`;
    action(...event.data.params);
  };
  return worker;
}
