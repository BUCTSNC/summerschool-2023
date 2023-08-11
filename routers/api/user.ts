import { Router } from "express";
import bodyParser from "body-parser";
import z, { string } from "zod";
import prisma from "../../prisma.js";
import sess from "../../middleware/session.js";
//获取时间函数
function getUserLoginTime() {
  var today = new Date();
  // var dd = today.getDate();
  // var mm = today.getMonth() + 1;
  // var yyyy = today.getFullYear();
  // var hour = today.getHours();
  // var minutes = today.getMinutes();
  // var seconds = today.getSeconds();
  // let todaytime = yyyy + "-" + mm + "-" + dd //+ " " + hour + ":" + minutes + ":" + seconds;

  //console.log(today);
  return today;
}

//定义全局变量记录用户登录时间
let userLoginTimeList: any[] = [];

// {
//     "email":"3401731883@qq.com",
//     "password":"Zyd4399"
//   }管理员账号1

// {
//     "email":"18539765046@qq.com",
//     "password":"Zyd4399"
//   }用户2

const router = Router();

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
            password,
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
  if (password === user.password) {
    req.session.userId = user.id;
    res.status(200).send("成功登录")

    //记录用户这一次登录的时间
    // let nowUserLoginTime = getUserLoginTime();
    // userLoginTimeList = userLoginTimeList.concat(nowUserLoginTime);
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

export default router;
