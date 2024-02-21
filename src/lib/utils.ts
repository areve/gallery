import { cloneDeep } from "lodash";

export function clone<T>(value: T) {
  return cloneDeep(value);
}

export function cloneExtend<T>(value: T, ...extend: Partial<T>[]) {
  return Object.assign(cloneDeep(value) as Partial<T>, ...(extend ?? [])) as T;
}
