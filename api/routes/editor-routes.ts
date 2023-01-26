import express from 'express'
import fs, { lstatSync } from 'fs'
import { setMetadata } from '../lib/png-metadata'
import bodyParser from 'body-parser'
import { config as c, EditorRoutesConfig } from '../config'
import sanitize from 'sanitize-filename'

const config = c as EditorRoutesConfig

export const editorRoutes = express.Router();

editorRoutes.use(bodyParser.json({limit: '200mb'}))

editorRoutes.post("/saveImage", async (req, res) => {
  const metadata = req.body.metadata || { history: [] }
  metadata.history = Array.isArray(metadata.history) ? metadata.history : [metadata.history]

  const pngData = req.body.image.replace('data:image/png;base64,', '')
  const filename = sanitize(req.body.filename)
  fs.writeFileSync(`${config.downloadsDir}/${filename}`, pngData, 'base64')
  const stat = lstatSync(`${config.downloadsDir}/${filename}`)
  if (config.debug) console.debug('metadata', metadata)
  await setMetadata(`${config.downloadsDir}/${filename}`, metadata)

  res.json({
    filename,
    modified: stat.mtime, // TODO this modified date may not be right and there's others too, it needs to be iso, not epoch
    metadata,
  })
})

editorRoutes.post("/deleteImage", async (req, res) => {
  if (!fs.existsSync(config.deletedDir)) fs.mkdirSync(config.deletedDir)
  const filename = sanitize(req.body.filename)

  if (config.debug) console.debug(`delete image: ${filename}`)
  fs.renameSync(`${config.downloadsDir}/${filename}`, `${config.deletedDir}/${filename}`)

  res.json({
    filename
  })
})
