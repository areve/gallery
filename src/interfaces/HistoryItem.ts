import type { HistoryItemComposition } from "./HistoryItemComposition";
import type { HistoryItemEdit } from "./HistoryItemEdit";
import type { HistoryItemGeneration } from "./HistoryItemGeneration";
import type { HistoryItemVariation } from "./HistoryItemVariation";

export type HistoryItem = HistoryItemGeneration | HistoryItemEdit | HistoryItemVariation | HistoryItemComposition;
