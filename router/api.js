import { Router } from "express";
import posterRouter from "./api/poster";

const apiRouter = Router();

apiRouter.use("/poster", posterRouter);

export default apiRouter