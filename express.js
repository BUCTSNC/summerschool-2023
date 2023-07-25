import express from "express";
import bodyParser from "body-parser";
import compression from "compression";

const app = express();
const jsonParser = bodyParser.json();
const compressor = compression();

const timer = async (req, res, next) => {
  const start = new Date().getTime();
  await next();
  console.log(`Use ${new Date().getTime() - start}ms`);
};

app.use(compressor);
app.use(timer);
app.get("/", (req, res) => res.send("hello, world"));
app.get("/hello/:username", (req, res) =>
  res.send(`hello, ${req.params.username}`)
);
app.post("/api/poster", jsonParser, (req, res) => {
  console.log(JSON.stringify(req.body));
  res.send("Received");
});
app.use("/:hello", (req, res) => {})
app.listen(3000);
