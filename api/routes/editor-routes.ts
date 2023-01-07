import express from 'express'
import dotenv from 'dotenv'
import { Configuration, CreateImageRequest, OpenAIApi } from 'openai'
import fs from 'fs'
import { setMetadata } from '../lib/png-metadata'

const env = dotenv.config().parsed!
const apiKey = env.OPEN_AI_KEY

const configuration = new Configuration({
  apiKey,
})
const openai = new OpenAIApi(configuration)
const debug = true
const debugSaveResponses = false
const mockRequests = false
const cleanUpTemp = true
const downloads = './public/downloads'
const tempDir = './public/downloads/temp'
const mocks = './public/mocks'

export const editorRoutes = express.Router();

editorRoutes.post("/createImage", async (req, res) => {
  const prompt = req.body.prompt
  if (debug) console.debug(`create image, prompt: ${prompt} (${prompt.length} chars)`)

  const request: CreateImageRequest = {
    prompt,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json",
    user: undefined
  }

  if (!fs.existsSync(downloads)) fs.mkdirSync(downloads)

  let data, datestamp;
  if (mockRequests) {
    data = JSON.parse(fs.readFileSync(`${mocks}/createImage-mock.json`, 'utf8'))
    datestamp = '20000101T000000'
  } else {
    datestamp = getDatestamp()
    const response = await openai.createImage(request)
    data = response.data
    if (debugSaveResponses) fs.writeFileSync(`${mocks}/createImage-${datestamp}.json`, JSON.stringify(data, null, '  '), 'utf8')
  }

  const filename = `image-0-${datestamp}.png`
  base64ToFile(`${downloads}/${filename}`, data.data[0].b64_json)

  const createdDate = new Date(0); 
  createdDate.setUTCSeconds(data.created);

  const metadata = {
    history: {
      method: 'createImage',
      filename,
      prompt,
      created: createdDate.toISOString(),
      version: 'OpenAI'
    }
  }

  if (debug) console.debug('metadata', metadata)

  await setMetadata(`${downloads}/${filename}`, metadata)

  res.json([{
    metadata,
    dataUrl: 'data:image/png;base64,' + data.data[0].b64_json
  }])
})


editorRoutes.post("/createImageVariation", async (req, res) => {
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)

  const pngData = req.body.image.replace('data:image/png;base64,','')
  const imageFilename = `image-${guid()}.png`
  fs.writeFileSync(`${tempDir}/${imageFilename}`, pngData, 'base64')
  if (debug) console.debug(`create image variation from: ${tempDir}/${imageFilename}`)

  let data, datestamp;
  if (mockRequests) {
    data = JSON.parse(fs.readFileSync(`${mocks}/createImageVariation-mock.json`, 'utf8'))
    datestamp = '20000101T000000'
  } else {
    datestamp = getDatestamp()
    const response = await openai.createImageVariation(
        fs.createReadStream(`${tempDir}/${imageFilename}`) as unknown as File,
        1,
        "1024x1024",
        "b64_json",
        undefined
    );
    data = response.data
    if (debugSaveResponses) fs.writeFileSync(`${mocks}/createImageVariation-${datestamp}.json`, JSON.stringify(response.data, null, '  '), 'utf8')
  }

  const filename = `image-0-${datestamp}.png`
  base64ToFile(`${downloads}/${filename}`, data.data[0].b64_json)

  const createdDate = new Date(0); 
  createdDate.setUTCSeconds(data.created);

  const metadata = {
    history: {
      method: 'createImageVariation',
      filename,
      created: createdDate.toISOString(),
      version: 'OpenAI'
    }
  }

  if (debug) console.debug('metadata', metadata)

  await setMetadata(`${downloads}/${filename}`, metadata)

  if (cleanUpTemp) fs.unlinkSync(`${tempDir}/${imageFilename}`) 
  res.json([{
    metadata,
    dataUrl: 'data:image/png;base64,' + data.data[0].b64_json
  }])
})

function base64ToFile(filePath, data) {
  return fs.writeFileSync(filePath, data, 'base64');
}

function guid() {
  // I'll come back to this another time
  return new Date().toISOString().replace(/[^\d]/g, '')
}
function getDatestamp() {
  return new Date()
    .toISOString()
    .replace(/[^\dTt\.]/g, '')
    .replace(/\..*/g, '')
}
