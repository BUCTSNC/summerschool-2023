import bodyParser from "body-parser";
import { Router } from "express";
import z from "zod";
import sess from "../../middleware/session.js";
import prisma from "../../prisma.js";
import bcrypt from "bcryptjs"

const router = Router();

//注册
const registrySchema = z.object({
  email: z.string().email(),
  telephone: z.string().optional(),
  password: z.string(),
  nickname: z.string().optional(),
  avatarUrl: z.string().optional()
  //other info is automatically set
})
//api/user/registry
router.post("/registry", bodyParser.json(), async (req, res) => {
  const data = req.body;
  const result = registrySchema.safeParse(data);
  if (result.success) {
    const count = await prisma.user.count({
      where:
      {
        isAdmin: true
      }
    });
    try {
      if (count === 0) {
        const { email, telephone, password, nickname, avatarUrl } = result.data;
        const createdUser = await prisma.user.create({
          data: {
            email,
            telephone,
            password: await bcrypt.hash(password, 8),
            nickname,
            avatarUrl,
            isAdmin: true,
          },
          select: { id: true },
        });
        res.send(String(createdUser.id));
      } else {
        const createdUser = await prisma.user.create(
          {
            data: result.data,
            select: {
              id: true
            },
          }
        );
        res.send(String(createdUser.id));
      }
    } catch (err) {
      console.log(err);
      res.status(403).send("请检查邮箱或手机号是否已经注册！");
    }
  } else {
    res.status(400).send("无效的注册信息");
  }
}
);
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})
// /api/user/login
router.post("/login", bodyParser.json(), sess, async (req, res) => {
  const data = req.body;
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    res.status(400).send("无效的登录信息");
    return undefined;
  }
  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: {
      email
    },
    select: {
      id: true,
      password: true
    }
  })

  if (user === null) {
    res.status(403).send("用户名或密码不正确")
    return undefined
  }
  if (await bcrypt.compare(password, user.password)) {
    req.session.userId = user.id;
    res.status(200).send("成功登录")
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date()
      }
    });
    return undefined
  }
  res.status(403).send("用户名或密码不正确")

})
//})

// GET /api/user/:userId
router.get("/:userId", async (req, res) => {
  const userId = Number(req.params.userId)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      nickname: true, email: true, posts: {
        select: { id: true, title: true }
      }
    }
  })

  if (user === null) {
    res.status(404).send("用户不存在")
    return undefined
  }

  res.json(user)
})

//Get/api/user/profile
router.get("/profile", sess, async (req, res) => {
  const userId = req.session.userId;
  if (userId === undefined) {
    res.status(403).send("未登录");
  }

  const user = await prisma.user.findUnique(
    {
      where: { id: userId },
      select: {
        email: true,
        telephone: true,
        nickname: true,
        avatarUrl: true,
        lastLogin: true
      }
    }
  )

  if (user === null) {
    res.status(404).send("用户不存在");
    return undefined;
  }
  return res.json(user)
})

router.get("/logout", sess, (req, res) => {
  req.session.destroy((err) => {
    if (err !== undefined) {
      res.status(500).send("注销失败");
      return undefined;
    } else {
      res.send("注销成功");
    }
  })
})


// 张云菲
// 修改登录密码的存储方式  
// 重新设置密码 
/*
思路：
 修改登录密码的存储方式：


重新设置密码：
请求方法：PUT
访问路径：`/api/user/password`
通过该路径可以更新用户的密码，要求：
- 该动作只能由已经登录的用户自己对自己的账号进行；
- 如果设置了query参数userId，则需要登录用户为管理员，可以设置目标用户的密码
先登录，检查是不是已登录状态，
若是已登录状态，可修改密码，否则返回需要登录的错误信息
修改密码若改好了返回修改成功，否则返回修改失败
检查是否为管理员账户
若是，输入修改时需加上要修改密码的账户的id
*/

const change_password = z.object(
  {
    password: z.string().min(3).max(30),
  }
)

router.put("/password", bodyParser.json(), sess, async (req, res) => {
  const userId = req.session.userId;  //当前登录的用户的id号
  const data = req.body   //相当于输入的json里的东西

  if (userId === undefined) {
    res.status(403).send("需要登录")
    return undefined
  }


  const result = change_password.safeParse(data)

  if (!result.success) {
    res.status(400).send("无效的用户输入")
    return undefined
  }

  const { password } = result.data;

  const anotherUserId = req.query.userId;

  if (anotherUserId !== undefined) {
    const user = await prisma.user.findUnique({
      where: { id: userId }, select: {
        isAdmin: true
      }
    })
    if (user?.isAdmin) {
      const targetUserId = Number(anotherUserId);
      const updated = await prisma.user.update({
        where: { id: targetUserId }, data: {
          password: await bcrypt.hash(password, 8)
        }
      })
      res.send(String(updated.id))
      return undefined
    }

    res.status(403).send("无权限")
    return undefined
  }

  try {
    const updated = await prisma.user.update({   //更新内容
      where: {
        id: userId
      },
      data: {
        password: await bcrypt.hash(password, 8)
      }
    })
    res.send(String(updated.id))
  } catch (err) {
    console.log()
    res.status(403).send("无效的用户ID")
  }
})

export default router
