export interface HistoryItemGeneration {
  method: 'generation';
  error?: string;
  prompt: string;
  filename: string;
  version: 'OpenAI';
  created?: string;
}
