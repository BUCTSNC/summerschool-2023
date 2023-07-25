import { Router } from "express";
import bodyParser from "body-parser";

const posterRouter = Router();
const jsonParser = bodyParser.json();

posterRouter.post("/", jsonParser, (req, res) => {
  console.log(JSON.stringify(req.body));
  res.send("Received");
});

export default posterRouter;
