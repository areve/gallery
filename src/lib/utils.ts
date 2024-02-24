import { clamp as lodashClamp, cloneDeep, merge as lodashMerge } from "lodash";

export const merge = lodashMerge as <T>(object: T, source: T) => T;
export const clamp = lodashClamp;
export const clone = cloneDeep as <T>(value: T)=> T;

export function cloneExtend<T>(value: T, ...extend: Partial<T>[]): T {
  return Object.assign(cloneDeep(value) as Partial<T>, ...(extend ?? [])) as T;
}
