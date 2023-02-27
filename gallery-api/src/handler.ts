import express from "express";
import { helloRoutes } from "./routes/hello-routes";
import { loginRoutes } from "./routes/login-routes";
import { openApiProxy } from "./routes/openapi-proxy";

export const handler = express().use("/hello", helloRoutes).use("/login", loginRoutes).use("/openai/*", openApiProxy);
