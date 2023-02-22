import express from "express";
import bodyParser from "body-parser";

export const helloRoutes = express.Router();

helloRoutes.use(bodyParser.json({ limit: "200mb" }));

helloRoutes.get("/", async (req, res) => {
  res.json({
    timeIs: new Date(),
  });
});
