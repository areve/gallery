import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { Configuration, CreateImageRequest, OpenAIApi } from 'openai'
import fs from 'fs'
import { setMetadata } from './lib/png-metadata'

const app = express()
app.use(bodyParser.json())
const env = dotenv.config().parsed!
const apiKey = env.OPEN_AI_KEY

const configuration = new Configuration({
  apiKey,
})

const openai = new OpenAIApi(configuration)
const debug = true
const mockRequests = false
const downloads = './public/downloads'

app.post("/api/createImage", async (req, res) => {
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

  let datestamp, data;

  if (mockRequests) {
    datestamp = 'mock'
    data = JSON.parse(fs.readFileSync(`${downloads}/createImage-${datestamp}.json`, 'utf8'))
  } else {
    datestamp = getDatestamp()
    const response = await openai.createImage(request)
    data = response.data
    fs.writeFileSync(`${downloads}/createImage-${datestamp}.json`, JSON.stringify(data, null, '  '), 'utf8')
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

export const handler = app

function base64ToFile(filePath, data) {
  return fs.writeFileSync(filePath, data, 'base64');
}

function getDatestamp() {
  return new Date()
    .toISOString()
    .replace(/[^\dTt\.]/g, '')
    .replace(/\..*/g, '')
}
