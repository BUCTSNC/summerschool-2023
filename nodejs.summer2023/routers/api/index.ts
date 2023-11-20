import { Router } from "express";
import postRouter from "./post.js";
import userRouter from "./user.js";
import commentRouter from "./comment.js";

const router = Router();

router.use("/post",postRouter);
router.use("/user",userRouter);
router.use("/comment",commentRouter);

export default router;