import type { Artwork, ArtworkError } from "@/interfaces/Artwork";
import type { ArtworkMetadata } from "@/interfaces/ArtworkMetadata";
import type { HistoryItem } from "@/interfaces/HistoryItem";
import { clone } from "./utils";

export function extendMetadata(
  metadata: ArtworkMetadata,
  historyItem: HistoryItem
) {
  const result = clone(metadata);
  result.history = Array.isArray(result.history)
    ? result.history
    : [result.history];
  result.history.push(historyItem);
  return result;
}

export function getReverseHistory(item: Artwork) {
  return clone([...item.metadata.history].reverse());
}

export function mostRecentPrompt(item: Artwork): string {
  const history = getReverseHistory(item);
  return (
    (history.filter((item: any) => "prompt" in item)[0] as any)?.prompt || ""
  );
}

export function mostRecentError(item: Artwork | ArtworkError): string {
  const history = getReverseHistory(item);
  return (
    (item as any).error || history.filter((item) => item?.error)[0]?.error || ""
  );
}
