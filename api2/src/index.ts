export const helloWorld = (req, res) => {
  let message = req.query?.message || req.body?.message || "Hello From TS3!";
  res.status(200).send(message);
};
