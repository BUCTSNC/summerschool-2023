var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import bodyParser from "body-parser";
import z from "zod";
import prisma from "../../prisma.js";
import sess from "../../middleware/session.js";
const router = Router();
const registrySchema = z.object({
    email: z.string().email(),
    telephone: z.string().optional(),
    password: z.string(),
    nickname: z.string().optional(),
    avatarurl: z.string().optional()
});
// /api/user/registry
router.post("/registy", bodyParser.json(), sess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = registrySchema.safeParse(data);
    if (result.success) {
        const count = yield prisma.user.count({
            where: {
                isAdmin: true,
            },
        });
        try {
            if (count == 0) {
                const { email, telephone, password, nickname, avatarurl } = result.data;
                const createdUser = yield prisma.user.create({
                    data: {
                        email,
                        telephone,
                        password,
                        nickname,
                        avatarurl,
                        isAdmin: true,
                    },
                    select: { id: true }, //只输出id
                });
                const userId = createdUser.id;
                res.send(String(userId));
                req.session.userId = userId;
            }
            else {
                const createdUser = yield prisma.user.create({
                    data: result.data,
                    select: { id: true }, //返给createdUser
                });
                const userId = createdUser.id;
                res.send(String(userId));
                req.session.userId = userId;
            }
        }
        catch (err) {
            res.status(403).send("请检查是否已注册");
        }
    }
    else {
        res.status(400).send("无效的注册信息");
    }
}));
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});
router.post("/login", bodyParser.json(), sess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = loginSchema.safeParse(data);
    if (!result.success) {
        res.status(400).send("无效登录信息");
        return undefined;
    }
    const { email, password } = result.data;
    const user = yield prisma.user.findUnique({
        where: { email }, select: {
            id: true, password: true //将password读到user中去
        }
    });
    if (user == null) {
        res.status(403).send("user not existed");
        return undefined;
    }
    if (password == user.password) {
        req.session.userId = user.id;
        //res.status(200).send("success")
        //res.status(301).setHeader("Location",'/api/post/').send("success");
        res.send("sucess");
        return undefined;
    }
    res.status(403).send("用户名或者密码不正确");
}));
router.get("/profile", sess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.userId;
    if (userId == undefined) {
        res.status(403).send("未登录");
        return undefined;
    }
    const user = yield prisma.user.findUnique({
        where: { id: userId }, select: {
            email: true, telephone: true, nickname: true,
            avatarurl: true
        }
    });
    if (user == null) {
        res.status(404).send("用户不存在");
        return undefined;
    }
    res.json(user);
}));
router.get("/logout", sess, (req, res) => {
    req.session.destroy((err) => {
        if (err != null) {
            res.status(400).send("注销失败");
        }
        else {
            res.send("注销成功");
        }
    });
});
const change_information = z.object({
    email: z.string().email(),
    nickname: z.string().optional(),
    telephone: z.string().optional(),
});
router.put("/information", bodyParser.json(), sess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.userId; //当前登录的用户的id号
    const data = req.body; //相当于输入的json里的东西
    if (userId === undefined) {
        res.status(403).send("需要登录");
        return undefined;
    }
    const result = change_information.safeParse(data);
    if (!result.success) {
        res.status(400).send("无效的用户输入");
        return undefined;
    }
    const { email } = result.data;
    const { nickname } = result.data;
    const { telephone } = result.data;
    const anotherUserId = req.query.userId;
    if (anotherUserId !== undefined) {
        const user = yield prisma.user.findUnique({
            where: { id: userId }, select: {
                isAdmin: true
            }
        });
        if (user === null || user === void 0 ? void 0 : user.isAdmin) {
            const targetUserId = Number(anotherUserId);
            const updated = yield prisma.user.update({
                where: {
                    id: targetUserId
                },
                data: {
                    email: email,
                    nickname: nickname,
                    telephone: telephone
                }
            });
            res.send(String(updated.id));
            return undefined;
        }
        res.status(403).send("无权限");
        return undefined;
    }
    try {
        const updated = yield prisma.user.update({
            where: {
                id: userId
            },
            data: {
                email: email,
                nickname: nickname,
                telephone: telephone
            }
        });
        res.send(String(updated.id));
    }
    catch (err) {
        console.log();
        res.status(403).send("无效的用户ID");
    }
}));
const change_password = z.object({
    password: z.string().min(3).max(30),
    repassword: z.string().min(3).max(30),
});
router.put("/password", bodyParser.json(), sess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.userId; //当前登录的用户的id号
    const data = req.body; //相当于输入的json里的东西
    if (userId === undefined) {
        res.status(403).send("需要登录");
        return undefined;
    }
    const result = change_password.safeParse(data);
    if (!result.success) {
        res.status(400).send("无效的用户输入");
        return undefined;
    }
    const { password } = result.data;
    const { repassword } = result.data;
    if (password == repassword) {
        const anotherUserId = req.query.userId;
        if (anotherUserId !== undefined) {
            const user = yield prisma.user.findUnique({
                where: { id: userId }, select: {
                    isAdmin: true
                }
            });
            if (user === null || user === void 0 ? void 0 : user.isAdmin) {
                const targetUserId = Number(anotherUserId);
                const updated = yield prisma.user.update({
                    where: {
                        id: targetUserId
                    },
                    data: {
                        password: password
                    }
                });
                res.send(String(updated.id));
                return undefined;
            }
            res.status(403).send("无权限");
            return undefined;
        }
        try {
            const updated = yield prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    password: password
                }
            });
            res.send(String(updated.id));
        }
        catch (err) {
            console.log();
            res.status(403).send("无效的用户ID");
        }
    }
    else {
        res.status(401).send("两次输入不匹配，请重新输入");
    }
}));
export default router;
