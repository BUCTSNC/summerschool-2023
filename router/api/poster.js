import { Router } from "express";
import bodyParser from "body-parser";
import z from "zod";

const posterSchema = z.object({
  email: z.string("Email must be a string").email("Email invalid"),
  content: z
    .string("Poster content must be a string")
    .min(5, "Poster too short, must longer than 5 characters")
    .max(255, "Poster too long, must shorter than 255 characters"),
});

const posterRouter = Router();
const jsonParser = bodyParser.json();

let posters = [];

posterRouter.post("/", jsonParser, (req, res) => {
  const validateResult = posterSchema.safeParse(req.body);
  if (validateResult.success) {
    posters = [...posters, validateResult.data];
    res.send("received");
  } else {
    res.status(400).send(validateResult.error.message);
  }
});

posterRouter.get("/", (req, res) => {
    res.json(posters)
})

export default posterRouter;
