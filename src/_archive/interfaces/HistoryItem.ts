export type HistoryItem = HistoryItemGeneration | HistoryItemEdit | HistoryItemVariation | HistoryItemComposition;

export interface HistoryItemComposition {
  method: "composition";
  error?: string;
  name: string;
  created: string;
}

export interface HistoryItemEdit {
  method: "edit";
  error?: string;
  prompt: string;
  name: string;
  version: "OpenAI";
  created?: string;
}
export interface HistoryItemGeneration {
  method: "generation";
  error?: string;
  prompt: string;
  name: string;
  version: "OpenAI";
  created?: string;
}

export interface HistoryItemVariation {
  method: "variation";
  error?: string;
  name: string;
  // image: Blob;
  version: "OpenAI";
  created?: string;
}
