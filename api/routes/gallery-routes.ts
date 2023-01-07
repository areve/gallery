import express from 'express'
import fs from 'fs'
import { readMetadata } from '../lib/png-metadata';

const downloads = './public/downloads'

export const galleryRoutes = express.Router();

galleryRoutes.get("/", async (req, res) => {
  const dir = fs.readdirSync(downloads)

  const list: any[] = []
  dir.forEach(filename => {
    const metadata = tryReadMetadata(`${downloads}/${filename}`)
    if (metadata) list.push({ filename, metadata })
  })
  list.sort((a, b) => -a.filename.localeCompare(b.filename))
  res.json(list)
})

function tryReadMetadata(filePath) {
  try {
    return readMetadata(filePath)
  } catch(e) {
  }
  return null
}