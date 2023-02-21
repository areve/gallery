export const helloWorld = (req, res) => {
  let message = req.query?.message || req.body?.message || "Hello From TS2!";
  res.status(200).send(message);
};
