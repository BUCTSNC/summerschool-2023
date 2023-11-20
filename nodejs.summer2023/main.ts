import compression from "compression";
import express from "express";
import timer from "./middleware/timer.js";
import apiRouter from "./routers/api/index.js";

const app = express();

app.use(compression());
app.use(timer);

app.use("/hello", (req, res) => {
    res.send("hello")
})
app.use("/api", apiRouter)

app.listen(4000);
