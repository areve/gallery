import type { ActionSpec } from "./../interfaces/Action";

export class MessageBus {
  windowOrWorker: Window | Worker;
  registry: { [name: string]: Function[] } = {};

  constructor(windowOrWorker: Window | Worker) {
    this.windowOrWorker = windowOrWorker;
    this.windowOrWorker.onmessage = (event: MessageEvent<ActionSpec>) => {
      const subscribers: Function[] = this.registry[event.data.name];
      if (!subscribers) console.warn(`subscribers not found: ${event.data.name}`);
      subscribers?.forEach((subscriber) => subscriber(...event.data.params));
    };
    this.windowOrWorker.onerror = (event: ErrorEvent) => {
      console.error("worker error" + event.message, event);
    };
  }

  subscribe(name: string, callback: Function) {
    if (!this.registry[name]) this.registry[name] = [];
    this.registry[name].push(callback);
  }

  publish(actionSpec: ActionSpec, structuredSerializeOptions?: StructuredSerializeOptions | any[]) {
    if (!this.windowOrWorker) console.error("publish to soon");
    this.windowOrWorker.postMessage(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
    return true;
  }
}

export function createMessageBus(worker: Window | Worker) {
  return new MessageBus(worker);
}
