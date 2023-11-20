import compression from "compression";
import express from "express";
import {join, dirname} from "node:path"
import timer from "./middlewares/timer.js";
import apiRouter from "./router/api.js";

const app = express();
const compressor = compression();

app.use(compressor);
app.use(timer);
const url = new URL(import.meta.url);
app.use(express.static(join(dirname(url.pathname), "public")));
app.use("/api", apiRouter);
app.listen(3000);
