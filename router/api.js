import { Router } from "express";
import posterRouter from "./api/poster.js";
import userRouter from "./api/user.js";

const apiRouter = Router();

apiRouter.use("/poster", posterRouter);
apiRouter.use("/user", userRouter)

export default apiRouter