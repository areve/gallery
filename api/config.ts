import { PathLike } from "fs";

export interface OpenaiRoutesConfig {
  tempDir: PathLike;
  mocks: PathLike;
  downloadsDir: PathLike;
}

export interface EditorRoutesConfig {
  debug: boolean;
  downloadsDir: PathLike;
  deletedDir: PathLike;
}

export const config: OpenaiRoutesConfig & EditorRoutesConfig = {
  downloadsDir: "./public/downloads",
  deletedDir: "./public/deleted",
  debug: true,
  tempDir: "./public/temp",
  mocks: "./public/mocks",
};
