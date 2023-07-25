import compression from "compression";
import express from "express";
import timer from "./middlewares/timer";
import apiRouter from "./router/api";

const app = express();
const compressor = compression();

app.use(compressor);
app.use(timer);
app.use("/api", apiRouter);
app.listen(3000);
