import { clamp as lodashClamp, cloneDeep, merge as lodashMerge } from "lodash";

export function clone<T>(value: T) {
  return cloneDeep(value);
}

export function cloneExtend<T>(value: T, ...extend: Partial<T>[]) {
  return Object.assign(cloneDeep(value) as Partial<T>, ...(extend ?? [])) as T;
}

export function merge<T>(object: T, source: T) {
  return lodashMerge(object, source);
}

export function clamp(number: number, lower: number, upper: number): number {
  return lodashClamp(number, lower, upper);
}
