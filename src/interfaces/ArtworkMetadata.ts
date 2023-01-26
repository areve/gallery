import type { HistoryItem } from "./HistoryItem";


export interface ArtworkMetadata {
  modified: Date;
  history: HistoryItem[];
}
