import { cloneDeep } from "lodash";

export function clone<T>(value: T) {
  return cloneDeep(value);
}
