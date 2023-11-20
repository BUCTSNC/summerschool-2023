import { Router } from "express";
import { readFile, writeFile } from "node:fs/promises";
import z from "zod";
import { addExitHook } from "../../utils/exitHooks.js";
import jsonParser from "../../middlewares/jsonParser.js";
import { requireLogin } from "../../middlewares/session.js";

const posterSchema = z.object({
  content: z
    .string("Poster content must be a string")
    .min(5, "Poster too short, must longer than 5 characters")
    .max(255, "Poster too long, must shorter than 255 characters"),
});

const posterRouter = Router();

let posters = await readFile("./posters.json")
  .then(JSON.parse)
  .catch((e) => {
    console.log(JSON.stringify(e));
    return [];
  });

posterRouter.use(requireLogin);

posterRouter.post("/", jsonParser, (req, res) => {
  const validateResult = posterSchema.safeParse(req.body);
  if (validateResult.success) {
    posters = [
      ...posters,
      { username: req.session.username, ...validateResult.data, createdAt: new Date().getTime() },
    ];
    res.send("received");
  } else {
    res.status(400).send(validateResult.error.message);
  }
});

posterRouter.get("/", (req, res) => {
  res.send(posters);
});

export default posterRouter;

addExitHook(async () => {
  console.log("Saving posters to file");
  await writeFile("./posters.json", JSON.stringify(posters));
  console.log("Saved");
});
