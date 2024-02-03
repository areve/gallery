import type { Rect } from "@/interfaces/Rect";
import { cloneDeep } from "lodash";

export function findErrorMessage(error: any): string {
  const result = error?.response?.data?.error?.message || error?.message;
  if (!result) {
    console.error(error);
  }
  return result || "Unknown Error";
}

export function loadImage(dataUrl: string | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const tempImage = new Image();
    tempImage.onload = () => {
      resolve(tempImage);
    };
    tempImage.onerror = (e) => {
      reject(e);
    };
    if (typeof dataUrl === "object") {
      tempImage.src = URL.createObjectURL(dataUrl);
    } else {
      // TODO not sure if I'm using this path anymore
      tempImage.src = dataUrl;
    }
  });
}

export function getDatestamp() {
  return new Date()
    .toISOString()
    .replace(/[^\dTt.]/g, "")
    .replace(/\..*/g, "");
}

export function epochToDate(epoch: number) {
  const createdDate = new Date(0);
  createdDate.setUTCSeconds(epoch);
  return createdDate;
}

export function rectanglesIntersect(a: Rect, b: Rect) {
  const isLeft = a.x + a.width < b.x;
  const isRight = a.x > b.x + b.width;
  const isAbove = a.y > b.y + b.height;
  const isBelow = a.y + a.height < b.y;
  return !(isLeft || isRight || isAbove || isBelow);
}

export function last<T>(array: T[]) {
  return array[array.length - 1];
}

export function clone<T>(value: T) {
  return cloneDeep(value);
}

export function cloneExtend<T>(value: T, ...extend: Partial<T>[]) {
  return Object.assign(cloneDeep(value) as Partial<T>, ...(extend ?? [])) as T;
}
