# Express常用中间件

中间件本身是一个函数`(req, res, next) => void`；而通常而言第三方中间件为了一些自定义行为，会提供一个函数用来构造中间件函数。例如`compression`中间件，可以通过下面方式来进行自定义：

```js
import compression from "compression";

const compressor = compression({
  level: 9, // 压缩级别
  memLevel: 8, // 最大内存占用级别
});
```

因此如果你不小心将`compression(options)`当作`compressor(req, res, next)`来使用了，你就会遇到请求没有响应的结果，因为JavaScript并不严格检查数据类型，`compression(options)`会直接忽略事件循环给予的后续两个参数执行完并退出，而不会给出任何错误信息。

要想在编程过程中解决这一问题，比较好的一个方案是使用TypeScript进行类型检查。

## 官方中间件

### compression压缩中间件

```bash
npm install compression
```

```js
const compressor = compression();

app.use(compressor);
```

### static静态文件中间件

无需额外安装。该中间件可以在请求的路径在目标文件夹下有对应文件时，发送那个文件给客户端。

```js
import express from "express";

app.use(express.static("./public"));
```

### body-parser上传数据解析中间件

```bash
npm install body-parser
```

```js
import bodyParser from "body-parser";

// 使用JSON格式的POST/PUT请求
app.use(bodyParser.json());
// 使用URL传输的GET请求主体
app.use(bodyParser.urlencoded());
```

### multer表单解析中间件（支持上传文件）

```bash
npm install multer
```

```js
import multer from "multer";

const uploader = multer({ dest: "./upload" });

// router路由的注册前缀为`/api/post`
router.post("/", uploader.array("medias", 6), (req, res) => {
  console.log(req.body, req.files);
  res.send("OK");
});
```

```html
<form method="post" action="/api/post">
  <input type="email" name="email" />
  <input type="text" name="title" />
  <input type="text" name="content" />
  <input type="file" name="medias" multiple />
  <button type="submit">提交</button>
</form>
```

### express-session/cookie-session 会话中间件

用于在不同的HTTP请求间维持会话状态信息。`express-session`中间件的会话主体信息存放于服务器内存中，凭据保存于客户端Cookie中；`cookie-session`中间件的会话主体信息存放于客户端Cookie中，有4096Byte的容量限制。

```bash
npm install express-session
# 或
npm install cookie-session
```

```js
// session
import session from "express-session";

const sess = session({
  name: "snc_express_app",
  secret: "fq9u80e4j3p85fadf",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 1000,
    secure:
      process.env["NODE_ENV"] === "production" &&
      process.env["USE_SECURE_COOKIE"] === "yes",
  },
});

app.post("/api/user/login", sess, async (req, res) => {
    // Some code
    req.session.userId = user.id;
    res.status(301).setHeader("Location", "/")
})

app.get("/api/user/profile", sess, async (req, res) => {
  if (req.session.userId === undefined) {
    res.status(403).send("Must login");
    return undefined;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
    select: {
      nickname: true,
      avatarUrl: true,
      email: true,
      telephone: true,
    },
  });

  if (user === null) {
    res.status(404).send("No such user");
    return undefined;
  }

  res.json(user);
});
```

TypeScript中，可以使用`declare module`的方法来声明会话数据类型：

```ts
declare module "express-session" {
  export interface SessionData {
    userId?: number;
  }
}
```

cookie-session的使用方法类似，不多做赘述。
