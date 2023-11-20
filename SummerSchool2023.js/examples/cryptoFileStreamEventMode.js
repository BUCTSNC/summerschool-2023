import { scrypt, createCipheriv } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import  { argv, exit } from "node:process";
import { promisify } from "node:util";

const scryptPromise = promisify(scrypt);

const [input, output, password, salt] = argv.slice(2, 6);

const key = await scryptPromise(password, salt, 24);

const cipher = createCipheriv("aes-192-cbc", key, Buffer.alloc(16, 0));

const rStream = createReadStream(input);
const wStream = createWriteStream(output);

rStream.on("data", data => {
  cipher.write(data)
})

rStream.on("end", () => {
  cipher.end();
})

cipher.on("data", data => {
  wStream.write(data)
})

cipher.on("end", () => {
  wStream.end()
})