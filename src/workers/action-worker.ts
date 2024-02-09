import type { ActionRegistry, ActionSpec } from "./ActionSpec";
import { registerActions } from "./offscreenArtboardService";

export function dispatch(actionSpec: ActionSpec, structuredSerializeOptions?: any[]) {
  postMessage(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
  return true;
}

const actions: ActionRegistry = {};

onmessage = function (event: MessageEvent<ActionSpec>) {
  const action: Function = actions[event.data.name];
  if (!action) throw `action not found: ${event.data.name}`;
  action(...event.data.params);
};

registerActions(actions);
