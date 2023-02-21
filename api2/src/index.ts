import express from "express";
import { helloRoutes } from "./routes/hello-routes";

export const handler = express().use("/api/hello", helloRoutes);
