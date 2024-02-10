import WebWorker from "@/workers/action-worker?worker";
import type { ActionSpec } from "@/interfaces/Action";
import { createMessageBus } from "@/services/actionService";

export const messageBus = createMessageBus(() => new WebWorker());


// TODO call directly?
export function dispatch(actionSpec: ActionSpec, structuredSerializeOptions?: any[]) {
  // if (!messageBus) console.error("dispatch too early", actionSpec);
  // if (!messageBus) return;
  messageBus.publish(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
  return true;
}
