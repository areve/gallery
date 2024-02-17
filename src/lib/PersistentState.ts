import { watchSyncEffect, type Ref } from "vue";

type StateCollection = { [key: string]: Ref };

const states: StateCollection = {};

export function usePersistentState(key: string, state: Ref) {
  states[key] = state;

  const loadedValue = window.localStorage.getItem(key);
  if (loadedValue) state.value = JSON.parse(loadedValue, dateReviver);

  watchSyncEffect(() => window.localStorage.setItem(key, JSON.stringify(state.value)));
}

function dateReviver(_: string, value: any) {
  const date: Date = new Date(Date.parse(value));
  if (!isNaN(date.getTime()) && date.toISOString() === value) return date;
  return value;
}
