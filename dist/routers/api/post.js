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
const postSchema = z.object({
    title: z.string().min(5).max(255),
    content: z.string().min(5).max(1024),
});
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
        return undefined;
    }
    res.status(403).send("没有权限");
}));
router.post("/", bodyParser.json(), sess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.userId;
    if (userId === undefined) {
        res.status(403).send("需要登录");
        return undefined;
    }
    const data = req.body;
    const result = postSchema.safeParse(data);
    if (result.success) {
        const { title, content } = result.data;
        try {
            const created = yield prisma.post.create({
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
            res.status(403).send("无效的用户ID");
        }
    }
    else {
        res.status(400).send("Failed");
    }
}));
export default router;
