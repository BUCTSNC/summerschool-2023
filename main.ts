import express from "express";
import compression from "compression";
// import {timer} from "./middleware/timer.js";
import apiRouter from "./routers/api/index.js";

const app = express();//创建一个名为app的应用程序

app.use(compression());//对响应进行压缩
// app.use(timer);//计时，main.js全部运行结束？

app.use("/api",apiRouter);
/*处理API请求的路由器，API（Application Programming Interface）允许应用程序之间进行
通信和交互。apiRouter负责将来自客户端的API请求路由到正确的处理程序或控制器。*/

app.use(express.static("./public"));

app.listen(4000);

/*通过调用 app 实例的各种方法来定义路由、设置中间件、处理请求等。
例如，你可以使用 app.get() 函数定义一个路由，
使用 app.use() 函数设置中间件，
使用 app.listen() 函数启动服务器等。*/
