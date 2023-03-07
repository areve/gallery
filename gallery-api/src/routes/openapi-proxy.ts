//import dotenv from "dotenv";
import proxy from "express-http-proxy";

// const env = dotenv.config().parsed!;
const apiKey = process.env.OPEN_AI_KEY;

//export const openApiProxy = proxy("api.openai.com", {
export const openApiProxy = proxy("api.openai.com", {
  https: true,
  limit: "10mb",
  proxyReqPathResolver: (req) => {
    console.log(`/v1/${req.params[0]}`);
    return `/v1/${req.params[0]}`;
  },
  proxyReqOptDecorator: (opts) => {
    opts.headers.Authorization = `Bearer ${apiKey}`;
    return opts;
  },
  userResHeaderDecorator(headers, req) {
    return {
      "Access-Control-Allow-Origin": req.headers.origin,
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    };
  },
});
