import express from "express";
import fs, { lstatSync } from "fs";
import { readMetadata } from "../lib/png-metadata";
import bodyParser from "body-parser";
import { Artwork } from "../../src/interfaces/Artwork";
import { ArtworkMetadata } from "../../src/interfaces/ArtworkMetadata";

const downloads = "./public/downloads";

export const galleryRoutes = express.Router();
galleryRoutes.use(bodyParser.json({ limit: "10mb" }));

galleryRoutes.get("/", async (req, res) => {
  const dir = fs.readdirSync(downloads);

  const list: Artwork[] = [];
  dir.forEach((filename) => {
    const metadata = tryReadMetadata(`${downloads}/${filename}`);
    const stat = lstatSync(`${downloads}/${filename}`);
    if (metadata)
      list.push({
        filename,
        modified: stat.mtime,
        metadata,
        status: "ready",
      });
  });
  list.sort(
    (a, b) => (b.modified?.getTime() || 0) - (a.modified?.getTime() || 0)
  );
  res.json(list);
});

galleryRoutes.get("/:filename", async (req, res) => {
  const filename = req.params.filename;
  let stat;
  try {
    stat = lstatSync(`${downloads}/${filename}`);
  } catch (e) {
    console.debug(`filename not found: ${filename}`);
  }
  if (!stat) return res.status(404);

  const metadata = tryReadMetadata(`${downloads}/${filename}`);

  const artwork: Artwork = {
    filename,
    modified: stat.mtime,
    metadata,
    status: "ready",
  };

  res.json(artwork);
});

function tryReadMetadata(filePath): ArtworkMetadata {
  const result: ArtworkMetadata = {
    history: [],
  };

  try {
    result.history = readMetadata(filePath).history || [];
  } catch (e) {
    result.history = [];
  }
  return result;
}
