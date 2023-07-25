import { Router } from "express";
import posterRouter from "./api/poster.js";

const apiRouter = Router();

apiRouter.use("/poster", posterRouter);

export default apiRouter