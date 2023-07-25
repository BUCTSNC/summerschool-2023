import { readFile, writeFile } from "node:fs/promises";
import { addExitHook } from "../../utils/exitHooks.js";
import { Router } from "express";

const userRouter = Router();

export default userRouter

let users = await readFile("./users.json", "utf-8")
  .then(JSON.parse)
  .catch((e) => {
    console.log(JSON.stringify(e));
    return [];
  });

addExitHook(async () => {
    console.log("Saving users to file")
    await writeFile("./users.json", JSON.stringify(users), "utf-8");
    console.log("Saved")
})