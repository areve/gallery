import WebWorker from "@/workers/action-worker?worker";
import type { ActionSpec } from "@/interfaces/Action";
import { createMessageBus, type MessageBus } from "@/services/actionService";

export const messageBus = createMessageBus()
startWorker();

export function startWorker() {
  console.log("startWorker", );
  // TODO
  messageBus.addWorker(new WebWorker());
  return messageBus;
}

export function stopWorker() {
  console.log("stopWorker");
  messageBus?.terminateWorker();
}

// TODO call directly?
export function dispatch(actionSpec: ActionSpec, structuredSerializeOptions?: any[]) {
  // if (!messageBus) console.error("dispatch too early", actionSpec);
  // if (!messageBus) return;
  messageBus.publish(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
  return true;
}
