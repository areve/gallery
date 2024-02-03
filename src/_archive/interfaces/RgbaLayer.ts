export type byte = number;
export type degrees = number;
export type fraction = number;

export type RgbaColor = [number, number, number, number];
export type RgbColor = [number, number, number];
export type RybColor = [number, number, number];
export type HsvColor = [degrees, fraction, byte];

export interface RgbaLayer {
  data: Float32Array;
  height: number;
  width: number;
  modified: Date;
}
