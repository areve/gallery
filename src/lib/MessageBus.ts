export type Message = {
  name: string;
  params: any[];
};

export interface MessageBus {
  subscribe(name: string, callback: Function): void;
  publish(message: Message, structuredSerializeOptions?: StructuredSerializeOptions | any[]): void;
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

  setupWorker() {
    const worker = this.getWorker();
    if (worker.onmessage) console.warn("onmessage was already bound");
    worker.onmessage = (event: MessageEvent<Message>) => {
      const subscribers: Function[] = this.registry[event.data.name];
      if (!subscribers) console.warn(`subscribers not found: ${event.data.name}`);
      subscribers?.forEach((subscriber) => subscriber(...event.data.params));
    };
    if (worker.onerror) console.warn("onerror was already bound");
    worker.onerror = (event: ErrorEvent) => {
      console.error(`worker error: ${event.message}`, event);
    };
    return worker;
  }

  terminateWorker() {
    if (!this.worker) return;
    this.worker.onmessage = null;
    this.worker.onerror = null;
    if (this.worker.constructor.name === "Worker") {
      (this.worker as Worker).terminate();
    }
    this.worker = undefined;
  }

  ensureWorker() {
    if (!this.worker) this.worker = this.setupWorker();
    return this.worker;
  }

  subscribe(name: string, callback: Function) {
    if (!this.registry[name]) this.registry[name] = [];
    this.registry[name].push(callback);
  }

  publish(message: Message, structuredSerializeOptions?: StructuredSerializeOptions | any[]) {
    this.ensureWorker().postMessage(message, structuredSerializeOptions as StructuredSerializeOptions);
  }
}

export function createMessageBus(getWorker: () => Worker | Window) {
  return new _MessageBus(getWorker) as MessageBus;
}
