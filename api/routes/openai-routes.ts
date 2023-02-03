import express from "express";
import dotenv from "dotenv";
import { Configuration, CreateImageRequest, OpenAIApi } from "openai";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { setMetadata } from "../lib/png-metadata";
import bodyParser from "body-parser";

const env = dotenv.config().parsed!;
const apiKey = env.OPEN_AI_KEY;

import { config as c, OpenaiRoutesConfig } from "../config";
const config = c as OpenaiRoutesConfig;

const configuration = new Configuration({
  apiKey,
});
const openai = new OpenAIApi(configuration);
const debug = true;
const debugSaveResponses = false;
const mockRequests = false;
const cleanUpTemp = true;

export const openaiRoutes = express.Router();

openaiRoutes.use(bodyParser.json({ limit: "10mb" }));

openaiRoutes.post("/createImage", async (req, res) => {
  const prompt = req.body.prompt;
  const metadata = req.body.metadata || { history: [] };
  metadata.history = Array.isArray(metadata.history)
    ? metadata.history
    : [metadata.history];

  if (debug)
    console.debug(`create image, prompt: ${prompt} (${prompt.length} chars)`);

  const request: CreateImageRequest = {
    prompt,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json",
    user: undefined,
  };

  if (!fs.existsSync(config.downloadsDir)) fs.mkdirSync(config.downloadsDir);

  let data, datestamp;
  if (mockRequests) {
    data = JSON.parse(
      fs.readFileSync(`${config.mocks}/createImage-mock.json`, "utf8")
    );
    datestamp = "20000101T000000";
  } else {
    datestamp = getDatestamp();
    const response = await openai.createImage(request);
    data = response.data;
    if (debugSaveResponses)
      fs.writeFileSync(
        `${config.mocks}/createImage-${datestamp}.json`,
        JSON.stringify(data, null, "  "),
        "utf8"
      );
  }

  const filename = `image-0-${datestamp}.png`;
  base64ToFile(`${config.downloadsDir}/${filename}`, data.data[0].b64_json);

  const createdDate = new Date(0);
  createdDate.setUTCSeconds(data.created);

  metadata.history.push({
    method: "createImage",
    filename,
    prompt,
    created: createdDate.toISOString(),
    version: "OpenAI",
  });

  if (debug) console.debug("metadata", metadata);

  await setMetadata(`${config.downloadsDir}/${filename}`, metadata);

  res.json([
    {
      filename,
      prompt,
      metadata,
      dataUrl: "data:image/png;base64," + data.data[0].b64_json,
    },
  ]);
});

openaiRoutes.post("/createImageVariation", async (req, res) => {
  if (!fs.existsSync(config.tempDir)) fs.mkdirSync(config.tempDir);
  const metadata = req.body.metadata || { history: [] };
  metadata.history = Array.isArray(metadata.history)
    ? metadata.history
    : [metadata.history];

  const pngData = req.body.image.replace("data:image/png;base64,", "");
  const imageFilename = `image-${uuid()}.png`;
  fs.writeFileSync(`${config.tempDir}/${imageFilename}`, pngData, "base64");
  if (debug)
    console.debug(
      `create image variation from: ${config.tempDir}/${imageFilename}`
    );

  let data, datestamp;
  if (mockRequests) {
    data = JSON.parse(
      fs.readFileSync(`${config.mocks}/createImageVariation-mock.json`, "utf8")
    );
    datestamp = "20000101T000000";
  } else {
    datestamp = getDatestamp();
    const response = await openai.createImageVariation(
      fs.createReadStream(
        `${config.tempDir}/${imageFilename}`
      ) as unknown as File,
      1,
      "1024x1024",
      "b64_json",
      undefined
    );
    data = response.data;
    if (debugSaveResponses)
      fs.writeFileSync(
        `${config.mocks}/createImageVariation-${datestamp}.json`,
        JSON.stringify(response.data, null, "  "),
        "utf8"
      );
  }

  const filename = `image-0-${datestamp}.png`;
  base64ToFile(`${config.downloadsDir}/${filename}`, data.data[0].b64_json);

  const createdDate = new Date(0);
  createdDate.setUTCSeconds(data.created);

  metadata.history.push({
    method: "createImageVariation",
    filename,
    created: createdDate.toISOString(),
    version: "OpenAI",
  });

  if (debug) console.debug("metadata", metadata);

  await setMetadata(`${config.downloadsDir}/${filename}`, metadata);

  if (cleanUpTemp) fs.unlinkSync(`${config.tempDir}/${imageFilename}`);
  res.json([
    {
      filename,
      metadata,
      dataUrl: "data:image/png;base64," + data.data[0].b64_json,
    },
  ]);
});

openaiRoutes.post("/createImageEdit", async (req, res) => {
  if (!fs.existsSync(config.tempDir)) fs.mkdirSync(config.tempDir);
  const metadata = req.body.metadata || { history: [] };
  metadata.history = Array.isArray(metadata.history)
    ? metadata.history
    : [metadata.history];

  const imageFilename = `image-${uuid()}.png`;
  fs.writeFileSync(
    `${config.tempDir}/${imageFilename}`,
    req.body.image.replace("data:image/png;base64,", ""),
    "base64"
  );

  const maskFilename = `mask-${uuid()}.png`;
  fs.writeFileSync(
    `${config.tempDir}/${maskFilename}`,
    req.body.mask.replace("data:image/png;base64,", ""),
    "base64"
  );

  const prompt = req.body.prompt || "extend this image";
  if (debug)
    console.debug(
      `create image edit from: ${config.tempDir}/${imageFilename}, mask ${config.tempDir}/${maskFilename},  prompt: ${prompt}`
    );

  const request: CreateImageRequest = {
    prompt,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json",
    user: undefined,
  };

  let data, datestamp;
  if (mockRequests) {
    data = JSON.parse(
      fs.readFileSync(`${config.mocks}/createImageEdit-mock.json`, "utf8")
    );
    datestamp = "20000101T000000";
  } else {
    datestamp = getDatestamp();
    let response;
    try {
      response = await openai.createImageEdit(
        fs.createReadStream(
          `${config.tempDir}/${imageFilename}`
        ) as unknown as File,
        fs.createReadStream(
          `${config.tempDir}/${maskFilename}`
        ) as unknown as File,
        prompt,
        1,
        "1024x1024",
        "b64_json",
        undefined
      );
    } catch (e) {
      console.error(
        // e.request.body,
        // e.request.res.responseUrl,
        // e.request.protocol,
        // e.request.host,
        // e.request._header,
        // e.request.path,
        // e.request.method,
        // e.request._req,
        e.response.status, // 2xx, 400, 5xx
        e.response.statusText,
        e.response?.data?.error
      );

      res.json({
        status: e.response.status,
        statusText: e.response.statusText,
        error: e.response?.data?.error,
      });
      return;
      // OHNO, undefined https://api.openai.com/v1/images/edits https: api.openai.com POST /v1/images/edits HTTP/1.1
      // Accept: application/json, text/plain, */*
      // Content-Type: multipart/form-data; boundary=--------------------------701616219903301918018942
      // User-Agent: OpenAI/NodeJS/3.1.0
      // Authorization: Bearer sk-blahblahblahblah
      // Host: api.openai.com
      // Connection: close
      // Transfer-Encoding: chunked
      //  /v1/images/edits POST undefined 400 BAD REQUEST
      // {
      //   code: 'billing_hard_limit_reached',
      //   message: 'Billing hard limit has been reached',
      //   param: null,
      //   type: 'invalid_request_error'
      // }
    }
    data = response.data;
    if (debugSaveResponses)
      fs.writeFileSync(
        `${config.mocks}/createImageEdit-${datestamp}.json`,
        JSON.stringify(response.data, null, "  "),
        "utf8"
      );
  }

  const filename = `image-0-${datestamp}.png`;
  base64ToFile(`${config.downloadsDir}/${filename}`, data.data[0].b64_json);

  const createdDate = new Date(0);
  createdDate.setUTCSeconds(data.created);

  metadata.history.push({
    method: "createImageEdit",
    prompt,
    filename,
    created: createdDate.toISOString(),
    version: "OpenAI",
  });

  if (debug) console.debug("metadata", metadata);

  await setMetadata(`${config.downloadsDir}/${filename}`, metadata);

  if (cleanUpTemp) fs.unlinkSync(`${config.tempDir}/${imageFilename}`);
  if (cleanUpTemp) fs.unlinkSync(`${config.tempDir}/${maskFilename}`);
  res.json([
    {
      filename,
      prompt,
      metadata,
      dataUrl: "data:image/png;base64," + data.data[0].b64_json,
    },
  ]);
});

function base64ToFile(filePath, data) {
  return fs.writeFileSync(filePath, data, "base64");
}

function getDatestamp() {
  return new Date()
    .toISOString()
    .replace(/[^\dTt\.]/g, "")
    .replace(/\..*/g, "");
}
