import express from 'express'
import fs, { lstatSync } from 'fs'
import { readMetadata } from '../lib/png-metadata';
import bodyParser from 'body-parser'
import { Artwork, ArtworkFile } from '../../src/interfaces/Artwork'
import { ArtworkMetadata } from '../../src/interfaces/ArtworkMetadata';

const downloads = './public/downloads'

export const galleryRoutes = express.Router();
galleryRoutes.use(bodyParser.json({ limit: '10mb' }))

galleryRoutes.get("/", async (req, res) => {
  const dir = fs.readdirSync(downloads)

  const list: ArtworkFile[] = []
  dir.forEach(filename => {
    const metadata = tryReadMetadata(`${downloads}/${filename}`)
    const stat = lstatSync(`${downloads}/${filename}`)
    metadata.modified = stat.mtime
    if (metadata) list.push({
      filename,
      metadata,
      status: 'ready',
    })
  })
  list.sort((a, b) => (b.metadata.modified?.getTime() || 0) - (a.metadata.modified?.getTime() || 0))
  res.json(list)
})

function tryReadMetadata(filePath): ArtworkMetadata {
  let result: ArtworkMetadata = {
    history: [],
    modified: new Date()
  }

  try {
    result.history = readMetadata(filePath).history || []
  } catch (e) {
  }
  return result
}