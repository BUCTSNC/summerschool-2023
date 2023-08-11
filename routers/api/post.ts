import bodyParser from "body-parser";
import { Router } from "express";
import z from "zod";
import prisma from "../../prisma.js";
import sess from "../../middleware/session.js";



const router = Router();

let posts = [];
const postSchema = z.object(
    {
        title: z.string().min(5).max(255),
        content: z.string().min(5).max(1024),
        email: z.string().email()
    }
)

// router.get("/", (req, res) => {
//     res.json(posts)

// })
router.get("/", async (req, res) => {
    const posts = await prisma.post.findMany();
    res.json(posts)

})

//发评论
router.post("/", bodyParser.json(), sess, async (req, res) => {

    const userId = req.session.userId;
    if (userId === undefined) {
        res.status(403).send("需要登录")
        return undefined
    }

    const data = req.body;
    const result = postSchema.safeParse(data)
    if (result.success) {
        const { title, content } = result.data;
        try {
            const created = await prisma.post.create({
                data: {
                    title,
                    content,
                    ipAdress: req.ip,
                    postedBy: {
                        connect: { id: userId }
                    }
                }
            })
            // posts = [...posts, data]
            //res.send("Successful")
            res.send(String(created.id))
        } catch (err) {
            console.log()
            res.status(403).send("无效用户id")
        }
    } else {
        res.status(400).send("Failed")
    }
});

router.delete("/:id", sess, async (req, res) => {
    const userId = req.session.userId;
    if (userId === undefined) {
        res.status(403).send("需要登录")
        return undefined
    }
    const id = Number(req.params.id)

    const count = await prisma.post.count({
        where: { id, postedBy: { id: userId } }
    })
    if (count === 1) {
        await prisma.post.update({
        where: { id },
        data: {
            deletedAt: new Date()
        }
    })
    res.send("删除成功")
    }
    
})



export default router;
