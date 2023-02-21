import express from "express";
import { helloRoutes } from "./routes/hello-routes";
import * as ff from '@google-cloud/functions-framework';

export const handler = express().use("/api/hello", helloRoutes);

ff.http('TypescriptFunction', handler);