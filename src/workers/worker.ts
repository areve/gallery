import { actions, type ActionSpec, type ArtboardWorkerMessage3 } from "./ArtboardWorkerInterfaces";

export function dispatch(actionSpec: ActionSpec, structuredSerializeOptions?: any[]) {
  postMessage(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
  return true;
}

onmessage = function (event: MessageEvent<ArtboardWorkerMessage3>) {
  const fn: Function = actions[event.data.name];
  if (fn) {
    fn(...event.data.params);
    return;
  }
};

export {};
