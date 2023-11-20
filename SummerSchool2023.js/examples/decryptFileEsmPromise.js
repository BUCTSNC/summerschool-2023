import { scrypt, createDecipheriv } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { argv, exit } from "node:process";
import { promisify } from "node:util";

const [input, output, password, salt] = argv.slice(2, 6);

const scryptPromise = promisify(scrypt);

try {
  const key = await scryptPromise(password, salt, 24);

  const decipher = createDecipheriv("aes-192-cbc", key, Buffer.alloc(16, 0));

  const inputData = await readFile(input);

  const decrypted = Buffer.concat([decipher.update(inputData), decipher.final()]);

  await writeFile(output, decrypted);
} catch (err) {
  console.log(err);
}
