import type { ActionSpec } from "@/interfaces/Action";

export interface MessageBus {
  subscribe(name: string, callback: Function): void;
  publish(actionSpec: ActionSpec, structuredSerializeOptions?: StructuredSerializeOptions | any[]): void;
  terminateWorker(): void;
}

class _MessageBus implements MessageBus {
  getWorker: () => Worker | Window;
  worker?: Window | Worker;
  registry: { [name: string]: Function[] } = {};

  constructor(getWorker: () => Worker | Window) {
    this.getWorker = getWorker;
    this.ensureWorker();
  }

  attachWorker() {
    if (!this.worker) return;
    // this.worker = worker;
    // TODO I think there's a better way than using onmessage
    this.worker.onmessage = (event: MessageEvent<ActionSpec>) => {
      const subscribers: Function[] = this.registry[event.data.name];
      if (!subscribers) console.warn(`subscribers not found: ${event.data.name}`);
      subscribers?.forEach((subscriber) => subscriber(...event.data.params));
    };
    this.worker.onerror = (event: ErrorEvent) => {
      console.error("worker error" + event.message, event);
    };
  }

  detachWorker() {
    if (!this.worker) return;
    this.worker.onmessage = null;
    this.worker.onerror = null;
  }

  terminateWorker() {
    if (!this.worker) return;
    this.detachWorker();
    if (this.worker.constructor.name === "Worker") {
      (this.worker as Worker).terminate();
    }
    this.worker = undefined;
  }

  ensureWorker() {
    console.log("ensureWorker", !!this.worker);
    if (!this.worker) {
      this.worker = this.getWorker();
      this.attachWorker();
    }
    return this.worker;
  }

  subscribe(name: string, callback: Function) {
    if (!this.registry[name]) this.registry[name] = [];
    this.registry[name].push(callback);
  }

  publish(actionSpec: ActionSpec, structuredSerializeOptions?: StructuredSerializeOptions | any[]) {
    this.ensureWorker().postMessage(actionSpec, structuredSerializeOptions as StructuredSerializeOptions);
  }
}

export function createMessageBus(getWorker: () => Worker | Window) {
  return new _MessageBus(getWorker) as MessageBus;
}
