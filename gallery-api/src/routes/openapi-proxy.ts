//import dotenv from "dotenv";
import proxy from "express-http-proxy";

// const env = dotenv.config().parsed!;
const apiKey = process.env.OPEN_AI_KEY;

//export const openApiProxy = proxy("api.openai.com", {
export const openApiProxy = proxy("api.openai.com", {
  https: true,
  limit: "10mb",
  proxyReqPathResolver: (req) => `/v1/${req.params[0]}`,
  proxyReqOptDecorator: (opts) => {
    opts.headers.Authorization = `Bearer ${apiKey}`;
    return opts;
  },
  userResHeaderDecorator(headers) {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    };
  },
});
