import express from 'express'
import { editorRoutes } from './routes/editor-routes'
import { openaiRoutes } from './routes/openai-routes'
import { openApiProxy } from './routes/openapi-proxy'
import { galleryRoutes } from './routes/gallery-routes'



export const handler = express()
    .use('/api/openai/*', openApiProxy)
    .use('/api/editor', editorRoutes)
    .use('/api/openai_old', openaiRoutes)
    .use('/api/gallery', galleryRoutes)
