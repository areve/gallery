import type { ActionRegistry, ActionSpec } from "@/interfaces/Action";

// TODO probably one of EventTarget, AnimationFrameProvider
//, GlobalEventHandlers, WindowEventHandlers, WindowLocalStorage
//, WindowOrWorkerGlobalScope, WindowSessionStorage
type Messagable = (Window & typeof globalThis) | Worker;
export function bindMessages(self: Messagable, actions: ActionRegistry) {
  self.onmessage = function (event: MessageEvent<ActionSpec>) {
    const action: Function = actions[event.data.name];
    if (!action) throw `action not found: ${event.data.name}`;
    action(...event.data.params);
  };
}

export function getDispatch(self: Messagable) {
  return function dispatch(actionSpec: ActionSpec, structuredSerializeOptions?: any[]) {
    self.postMessage(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
    return true;
  };
}
