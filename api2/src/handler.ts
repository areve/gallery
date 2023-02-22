import express from "express";
import { helloRoutes } from "./routes/hello-routes";
import { openApiProxy } from "./routes/openapi-proxy";

export const handler = express().use("/api2/hello", helloRoutes).use("/api2/openai/*", openApiProxy);
