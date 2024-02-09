export type ActionRegistry = { [k: string]: Function };

export interface ActionWorker extends Worker {
  postMessage(message: ActionSpec, transfer: Transferable[]): void;
  postMessage(message: ActionSpec, options?: StructuredSerializeOptions): void;
}

export type ActionSpec = {
  name: string;
  params: any[];
};
