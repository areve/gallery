
export type HistoryItem = HistoryItemGeneration | HistoryItemEdit | HistoryItemVariation | HistoryItemComposition;


export interface HistoryItemComposition {
    method: 'composition';
    error?: string;
    filename: string;
    created: string;
}


export interface HistoryItemEdit {
    method: 'edit';
    error?: string;
    prompt: string;
    filename: string;
    // image: Blob;
    // mask: Blob;
    version: 'OpenAI';
    created?: string;
}
export interface HistoryItemGeneration {
    method: 'generation';
    error?: string;
    prompt: string;
    filename: string;
    version: 'OpenAI';
    created?: string;
}


export interface HistoryItemVariation {
    method: 'variation';
    error?: string;
    filename: string;
    // image: Blob;
    version: 'OpenAI';
    created?: string;
}
