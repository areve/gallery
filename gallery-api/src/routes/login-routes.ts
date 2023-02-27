import express from "express";
import bodyParser from "body-parser";

export const loginRoutes = express.Router();

loginRoutes.use(bodyParser.json());
function toBase64(value: string) {
  const buffer = Buffer.from(value);
  return buffer.toString("base64");
}
loginRoutes.post("/", async (req, res) => {
  res.redirect("http://localhost:5173/google-quick.html#login=" + toBase64(JSON.stringify(req.body)));
});
