import { Router } from "express";
import postRouter from "./post.js";
import userRouter from "./user.js";

const router=Router();//使用 express.Router() 方法来创建一个独立的路由器

router.use("/post",postRouter)
/*将 postRouter 路由器实例添加为 router 的子路由器，
并指定该子路由器要处理的基础路径为 “/post”。*/
//postRouter 是一个在 Express.js 应用程序中使用的路由器实例，用于处理与帖子相关的路由。

router.use("/user",userRouter);

export default router;
