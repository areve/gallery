import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());


app.post("/api/hello", (req, res) => {
    console.log('prompts', req.body)
  res.json(req.body);
});

export const handler = app;