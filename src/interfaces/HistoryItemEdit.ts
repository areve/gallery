
export interface HistoryItemEdit {
  method: 'edit';
  error?: string;
  prompt: string;
  filename: string;
  image: Blob;
  mask: Blob;
  version: 'OpenAI';
  created?: string;
}
