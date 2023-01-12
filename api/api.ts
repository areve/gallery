import express from 'express'
import bodyParser from 'body-parser'
import { editorRoutes } from './routes/editor-routes'
import { openApiProxy } from './routes/openapi-proxy'
import { galleryRoutes } from './routes/gallery-routes'

const app = express()
app.use(bodyParser.json({limit: '200mb'}))

app.use('/api/openai/*', openApiProxy);
app.use('/api/editor', editorRoutes);
app.use('/api/gallery', galleryRoutes);

export const handler = app
