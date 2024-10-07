import type { FileInfo } from "@/lib/Google/GoogleApi";
import { merge } from "@/lib/utils";
import { ref, watchSyncEffect, type Ref } from "vue";
import { cacheDelete, cacheGetText, cachePutText } from "./cacheService";

type StateCollection = { [key: string]: Ref };

const states: StateCollection = {};

export const fileStoreState = await useCacheState("fileStore", ref<FileInfo[]>([]));

export async function useCacheState(key: string, state: Ref) {
  states[key] = state;

  const loadedValue = await cacheGetText("cacheState", key);
  if (loadedValue) state.value = merge(state.value, JSON.parse(loadedValue, dateReviver));
  //   console.log("loadedValue", key, loadedValue);
  watchSyncEffect(async () => await cachePutText("cacheState", key, JSON.stringify(state.value)));
  //   cacheDelete("cacheState", key)
  return state;
}

function dateReviver(_: string, value: any) {
  const date: Date = new Date(Date.parse(value));
  if (!isNaN(date.getTime()) && date.toISOString() === value) return date;
  return value;
}
