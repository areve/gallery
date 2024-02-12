export type Message = {
  name: string;
  params: any[];
};

export interface MessageBus {
  subscribe(name: string, callback: Function): void;
  publish(message: Message, structuredSerializeOptions?: StructuredSerializeOptions | any[]): void;
  terminateWorker(): void;
}

export function createMessageBus(getWorker: () => Worker | Window) {
  let worker: Worker | Window | undefined;
  const registry: { [name: string]: Function[] } = {};

  const messageBus: MessageBus = {
    subscribe,
    publish,
    terminateWorker,
  };

  ensureWorker();

  return messageBus;

  function setupWorker() {
    const worker = getWorker();
    if (worker.onmessage) console.warn("onmessage was already bound");
    worker.onmessage = (event: MessageEvent<Message>) => {
      const subscribers: Function[] = registry[event.data.name];
      if (!subscribers) console.warn(`subscribers not found: ${event.data.name}`);
      subscribers?.forEach((subscriber) => subscriber(...event.data.params));
    };
    if (worker.onerror) console.warn("onerror was already bound");
    worker.onerror = (event: ErrorEvent) => {
      console.error(`worker error: ${event.message}`, event);
    };
    return worker;
  }

  function terminateWorker() {
    if (!worker) return;
    worker.onmessage = null;
    worker.onerror = null;
    if (worker.constructor.name === "Worker") {
      (worker as Worker).terminate();
    }
    worker = undefined;
  }

  function ensureWorker() {
    if (!worker) worker = setupWorker();
    return worker;
  }

  function subscribe(name: string, callback: Function) {
    if (!registry[name]) registry[name] = [];
    registry[name].push(callback);
  }

  function publish(message: Message, structuredSerializeOptions?: StructuredSerializeOptions | any[]) {
    ensureWorker().postMessage(message, structuredSerializeOptions as StructuredSerializeOptions);
  }
}
