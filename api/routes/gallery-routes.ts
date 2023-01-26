import express from 'express'
import fs, { lstatSync } from 'fs'
import { readMetadata } from '../lib/png-metadata';
import bodyParser from 'body-parser'
import { GalleryMetadata } from '../../src/interfaces/GalleryMetadata'
import { ArtworkBase, ArtworkFile } from '../../src/interfaces/Artwork'

const downloads = './public/downloads'

export const galleryRoutes = express.Router();
galleryRoutes.use(bodyParser.json({ limit: '10mb' }))

galleryRoutes.get("/", async (req, res) => {
  const dir = fs.readdirSync(downloads)

  const list: ArtworkFile[] = []
  dir.forEach(filename => {
    const metadata = tryReadMetadata(`${downloads}/${filename}`)
    const stat = lstatSync(`${downloads}/${filename}`)
    const modified = stat.mtime
    if (metadata) list.push({
      filename,
      modified, //TODO modified not here?
      metadata,
      status: 'file',
    })
  })
  list.sort((a, b) => (b.modified?.getTime() || 0) - (a.modified?.getTime() || 0))
  res.json(list)
})

function tryReadMetadata(filePath): GalleryMetadata {
  let result: GalleryMetadata = {
    history: []
  }

  try {
    result.history = readMetadata(filePath).history || []
  } catch (e) {
  }
  return result
}