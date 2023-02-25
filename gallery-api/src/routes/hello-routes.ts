import express from "express";
import bodyParser from "body-parser";

export const helloRoutes = express.Router();

helloRoutes.use(bodyParser.json({ limit: "200mb" }));

helloRoutes.get("/", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.json({
    timeIs: new Date(),
  });
});

helloRoutes.options("/", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.json({
    timeIs: new Date(),
  });
});
