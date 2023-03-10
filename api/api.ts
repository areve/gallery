import express from "express";
import { editorRoutes } from "./routes/editor-routes";
import { galleryRoutes } from "./routes/gallery-routes";

export const handler = express().use("/api/editor", editorRoutes).use("/api/gallery", galleryRoutes);
