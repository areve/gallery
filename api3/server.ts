//import { handler } from './../api/api';
import express from "express";
import { helloWorld } from "../api2";

const app = express();

app.get("/foo", helloWorld);

// app.listen(5000);
export const handler = app;
