import { readFile, writeFile } from "node:fs/promises";
import { addExitHook } from "../../utils/exitHooks.js";
import { Router } from "express";
import jsonParser from "../../middlewares/jsonParser.js";
import bcrypt from "bcrypt";
import z from "zod";

const userRouter = Router();

let users = await readFile("./users.json", "utf-8")
  .then(JSON.parse)
  .catch((e) => {
    console.log(JSON.stringify(e));
    return [];
  });

const userBasicSchema = z.object({
  username: z
    .string("username must be a string")
    .email("username must be a vaildated email address"),
  password: z
    .string("password must be a string")
    .min(6, "password should longer than 6 characters")
    .max(32, "password should shorter than 32 characters"),
});

userRouter.post("/registry", jsonParser, async (req, res) => {
  const validateResult = userBasicSchema.safeParse(req.body);
  if (validateResult.success) {
    const { username, password } = validateResult.data;
    if (users.findIndex((user) => user.username === username) === -1) {
      const hashedPassword = await bcrypt.hash(password, 8);
      users = [...users, { username, password: hashedPassword }];
      res.send("Success");
    } else {
      res.status(400).send("username already used.");
    }
  } else {
    res.status(400).send(validateResult.error.message);
  }
});

userRouter.post("/login", jsonParser, async (req, res) => {
  const validateResult = userBasicSchema.safeParse(req.body);
  if (validateResult.success) {
    const { username, password } = validateResult.data;
    const user = users.find((user) => user.username === username);
    if (user === undefined) {
      res.status(404).send("No such user");
    } else if (await bcrypt.compare(password, user.password)) {
      req.session.username = username;
      res.send("Successful login");
    } else {
      res
        .status(403)
        .send("Failed to login, please check username or password");
    }
  } else {
    res.status(400).send(validateResult.error.message);
  }
});

userRouter.post("/logout", (req, res) => {
  req.session.destroy();
  res.send("Logout");
});

export default userRouter;

addExitHook(async () => {
  console.log("Saving users to file");
  await writeFile("./users.json", JSON.stringify(users), "utf-8");
  console.log("Saved");
});
