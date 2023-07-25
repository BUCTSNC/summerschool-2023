import compression from "compression";
import express from "express";
import timer from "./middlewares/timer.js";
import apiRouter from "./router/api.js";

const app = express();
const compressor = compression();

app.use(compressor);
app.use(timer);
app.use("/api", apiRouter);
app.listen(3000);
