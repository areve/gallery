import type { ActionSpec } from "@/interfaces/Action";

export interface MessageBus {
  addWorker(worker: Window | Worker): void;
  subscribe(name: string, callback: Function): void;
  publish(actionSpec: ActionSpec, structuredSerializeOptions?: StructuredSerializeOptions | any[]): void;
  terminateWorker(): void;
}

class _MessageBus implements MessageBus {
  worker?: Window | Worker;
  registry: { [name: string]: Function[] } = {};

  addWorker(worker: Window | Worker) {
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
    if (!this.worker) return console.error("publish to soon");
    this.worker.postMessage(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
  }

  terminateWorker() {
    (this.worker as Worker)?.terminate();
    this.worker = undefined;
  }
}

export function createMessageBus() {
  return new _MessageBus() as MessageBus;
}
