import WebWorker from "@/workers/action-worker?worker";
import type { ActionSpec, ActionWorker } from "@/interfaces/Action";
import { createMessageBus, type MessageBus } from "@/services/actionService";

export let messageBus: MessageBus | undefined;
let actionWorker: ActionWorker | undefined = undefined;

export function startWorker() {
  actionWorker = new WebWorker() as ActionWorker;
  messageBus = createMessageBus(actionWorker);
}

export function stopWorker() {
  actionWorker?.terminate();
  actionWorker = undefined;
}

// TODO call directly?
export function dispatch(actionSpec: ActionSpec, structuredSerializeOptions?: any[]) {
  if (!messageBus) console.error("dispatch too early", actionSpec);
  if (!messageBus) return;
  messageBus.publish(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
  return true;
}
