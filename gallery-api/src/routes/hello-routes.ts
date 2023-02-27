import express from "express";
import bodyParser from "body-parser";

export const helloRoutes = express.Router();

helloRoutes.use(bodyParser.json({ limit: "200mb" }));

helloRoutes.get("/", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Authorization");
  // console.log(req.headers.authorization);
  const token = req.headers.authorization.split(" ", 2)[1];
  // console.log(token);
  const CLIENT_ID = "750379347440-mp8am6q8hg41lvkn8pi4jku3eq7ts2lq.apps.googleusercontent.com";
  const { OAuth2Client } = require("google-auth-library");
  const client = new OAuth2Client(CLIENT_ID);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return {
      payload,
      userid,
    };
  }
  const result = await verify().catch((e) => {
    console.error(e.toString()); // JSON.stringify doesn't work on this object!?
    res.status(403).json({
      error: "not allowed",
      timeIs: new Date(),
    });
    return false;
  });
  if (!result) return;
  console.log(result);

  res.json({
    timeIs: new Date(),
  });
});

helloRoutes.options("/", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Authorization");
  res.json({
    timeIs: new Date(),
  });
});
