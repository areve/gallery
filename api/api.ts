import express from 'express'
import bodyParser from 'body-parser'
import { editorRoutes } from './routes/editor-routes'

const app = express()
app.use(bodyParser.json())

app.use('/api/editor', editorRoutes);

export const handler = app
