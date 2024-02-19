import { v4 as uuid } from "uuid";

export type Message = {
  name: string;
  params: any[];
  callbackId?: string;
};

export interface MessageBus {
  unsubscribe(name: string, callback: Function): void;
  subscribe(name: string, callback: Function): void;
  publish(message: Message, structuredSerializeOptions?: StructuredSerializeOptions | any[], callback?: Function): void;
  terminateWorker(): void;
}

export function createMessageBus(getWorker: () => Worker | Window) {
  let worker: Worker | Window | undefined;
  const registry: { [name: string]: Function[] } = {};

  const messageBus: MessageBus = {
    subscribe,
    unsubscribe,
    publish,
    terminateWorker,
  };

  ensureWorker();

  return messageBus;

  function ensureWorker() {
    if (!worker) worker = setupWorker();
    return worker;
  }

  function setupWorker() {
    const worker = getWorker();
    if (worker.onmessage) console.warn("onmessage was already bound");
    worker.onmessage = (event: MessageEvent<Message>) => {
      const subscribers: Function[] = registry[event.data.name];
      if (!subscribers) console.warn(`subscribers not found: ${event.data.name}`);
      subscribers?.forEach(async (subscriber) => {
        // TODO wrap with try catch so callbackId can be called
        const result = await subscriber(...event.data.params);
        if (event.data.callbackId)
          messageBus.publish({
            name: event.data.callbackId,
            params: [result],
          });
      });
    };
    if (worker.onerror) console.warn("onerror was already bound");
    worker.onerror = (event: ErrorEvent) => {
      console.error(`worker error: ${event.message}`, event);
    };
    return worker;
  }

  function subscribe(name: string, callback: Function) {
    if (!registry[name]) registry[name] = [];
    registry[name].push(callback);
  }

  function unsubscribe(name: string, callback: Function) {
    if (!registry[name]) registry[name] = [];
    const index = registry[name].indexOf(callback);
    if (index !== -1) registry[name].splice(index, 1);
  }

  function publish(message: Message, structuredSerializeOptions?: StructuredSerializeOptions | any[], callback?: Function) {
    if (callback) {
      const callbackId = `callback:${uuid()}`;
      const callbackWrapper = (result: any) => {
        unsubscribe(callbackId, callbackWrapper);
        callback(result);
      };
      // TODO handle exceptions and pass them back
      subscribe(callbackId, callbackWrapper);
      ensureWorker().postMessage({ ...message, callbackId }, structuredSerializeOptions as StructuredSerializeOptions);
    } else {
      ensureWorker().postMessage(message, structuredSerializeOptions as StructuredSerializeOptions);
    }
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
}
