import type { ActionSpec } from "@/interfaces/Action";

export class MessageBus {
  worker: Window | Worker;
  registry: { [name: string]: Function[] } = {};

  constructor(worker: Window | Worker) {
    this.worker = worker;
    this.worker.onmessage = (event: MessageEvent<ActionSpec>) => {
      const subscribers: Function[] = this.registry[event.data.name];
      if (!subscribers) console.warn(`subscribers not found: ${event.data.name}`);
      subscribers?.forEach((subscriber) => subscriber(...event.data.params));
    };
    this.worker.onerror = (event: ErrorEvent) => {
      console.error("worker error" + event.message, event);
    };
  }

  subscribe(name: string, callback: Function) {
    if (!this.registry[name]) this.registry[name] = [];
    this.registry[name].push(callback);
  }

  publish(actionSpec: ActionSpec, structuredSerializeOptions?: StructuredSerializeOptions | any[]) {
    if (!this.worker) console.error("publish to soon");
    this.worker.postMessage(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
    return true;
  }
}

export function createMessageBus(worker: Window | Worker) {
  return new MessageBus(worker);
}
