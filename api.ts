import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv'


const app = express();
app.use(bodyParser.json());
const env = dotenv.config().parsed!
const apiKey = env.OPEN_AI_KEY

app.post("/api/createImage", (req, res) => {
  console.log('prompts', req.body,  apiKey)
  res.json(req.body);
});

export const handler = app;