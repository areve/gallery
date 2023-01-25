
export interface HistoryItemVariation {
  method: 'variation';
  error?: string;
  filename: string;
  image: Blob;
  version: 'OpenAI';
  created?: string;
}
