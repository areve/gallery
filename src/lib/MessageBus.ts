import { v4 as uuid } from "uuid";

export type Message = {
  name: string;
  params: any[];
  callbackId?: string;
};

export interface MessageBus {
  unsubscribe(name: string, callback: Function): void;
  subscribe(name: string, callback: Function): void;
  publish<T>(name: string, params: any[], structuredSerializeOptions?: StructuredSerializeOptions | any[]): Promise<T>;
  publishMessage<T>(message: Message, structuredSerializeOptions?: StructuredSerializeOptions | any[]): Promise<T>;
  terminateWorker(): void;
}

export function createMessageBus(getWorker: () => Worker | Window) {
  let worker: Worker | Window | undefined;
  const registry: { [name: string]: Function[] } = {};

  const messageBus: MessageBus = {
    subscribe,
    unsubscribe,
    publish,
    publishMessage,
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
        let result: any;
        let error: any;
        try {
          result = await subscriber(...event.data.params);
        } catch (e: any) {
          error = e;
        }

        if (event.data.callbackId) {
          messageBus.publishMessage({
            name: event.data.callbackId,
            params: [error, result],
          });
        }
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

  function publish<T>(name: string, params: any[], structuredSerializeOptions?: StructuredSerializeOptions | any[]) {
    return publishMessage<T>({ name, params }, structuredSerializeOptions);
  }

  function publishMessage<T>(message: Message, structuredSerializeOptions?: StructuredSerializeOptions | any[]) {
    return new Promise<T>((resolve, reject) => {
      const messageIsCallback = /^callback:/.test(message.name);
      if (messageIsCallback) {
        ensureWorker().postMessage(message, structuredSerializeOptions as StructuredSerializeOptions);
        resolve(undefined as T);
      } else {
        // TODO calling back always is not very efficient
        const callbackId = `callback:${uuid()}`;
        const callbackWrapper = (error: any, result: any) => {
          unsubscribe(callbackId, callbackWrapper);
          if (error) return reject(error);
          resolve(result);
        };
        subscribe(callbackId, callbackWrapper);
        ensureWorker().postMessage({ ...message, callbackId }, structuredSerializeOptions as StructuredSerializeOptions);
      }
    });
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
