var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bodyParser from "body-parser";
import { Router } from "express";
import z from "zod";
import prisma from "../../prisma.js";
import sess from "../../middleware/session.js";
const router = Router();
//let posts = [];//用来装输入信息
const postSchema = z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1).max(1024),
    //email:z.string().email()
}); //描述输入限制
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield prisma.post.findMany({
        where: {
            deletedAt: null
        }
    });
    res.json(posts);
}));
router.delete("/:id", sess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.userId;
    if (userId === undefined) {
        res.status(403).send("需要登录");
        return undefined;
    }
    const id = Number(req.params.id);
    const count = yield prisma.post.count({
        where: { id, postedBy: { id: userId } }
    });
    if (count === 1) {
        yield prisma.post.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });
        res.send("删除成功");
    }
    else {
        res.send(`id值为${id},count值为${count}`);
    }
}));
/*router.get(path, callback)
用于处理 HTTP GET 请求。
path 是路由的路径，可以是一个字符串或一个正则表达式。
callback 是处理请求的回调函数，接收请求和响应对象作为参数，用于处理请求并发送响应。
 */
router.post("/sub", bodyParser.json(), sess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.userId;
    if (userId == undefined) {
        res.status(403).send("需要登录");
        return undefined;
    }
    const data = req.body;
    const result = postSchema.safeParse(data);
    if (result.success) {
        const { title, content } = result.data;
        //posts=[...posts, data]
        try {
            const created = yield prisma.post.create({
                //data:data
                data: {
                    title, content, ipAddress: req.ip, postedBy: {
                        connect: { id: userId }
                    }
                }
            });
            res.send(String(created.id));
        }
        catch (err) {
            console.log(String(err));
            res.status(403).send("无效id");
        }
    }
    else {
        console.log(data);
        res.status(400).send(data);
    }
}));
//bodyParser.json()是一个常用的中间件函数，用于解析传入的请求体，并将其转换为JSON格式。
/*router.post(path, callback)
用于处理 HTTP POST 请求。
path 和 callback 的使用方式与 router.get() 类似，但是用于处理 POST 请求。
 */
//评论
router.post("/comment", bodyParser.json(), sess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.userId;
    if (userId == undefined) {
        res.status(403).send("需要登录");
        return undefined;
    }
    const data = req.body;
    const result = postSchema.safeParse(data);
    if (result.success) {
        const { title, content } = result.data;
        //posts=[...posts, data]
        try {
            const created = yield prisma.post.create({
                //data:data
                data: {
                    title, content, ipAddress: req.ip, postedBy: {
                        connect: { id: userId }
                    }
                }
            });
            res.send(String(created.id));
        }
        catch (err) {
            console.log(String(err));
            res.status(403).send("无效id");
        }
    }
    else {
        console.log(data);
        res.status(400).send(data);
    }
}));
export default router;
