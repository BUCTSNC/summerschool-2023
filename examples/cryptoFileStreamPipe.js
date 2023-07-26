const { scrypt, createCipheriv } = await import("node:crypto");
const { createReadStream, createWriteStream } = await import("node:fs");
// const { stat } = await import("node:fs/promises");
const { argv, exit } = await import("node:process");
const { promisify } = await import("node:util");

const scryptPromise = promisify(scrypt);

const [input, output, password, salt] = argv.slice(2, 6);

const key = await scryptPromise(password, salt, 24);

const cipher = createCipheriv("aes-192-cbc", key, Buffer.alloc(16, 0));

// const inputSize = (await stat(input)).size

const rStream = createReadStream(input);
const wStream = createWriteStream(output);

rStream.pipe(cipher).pipe(wStream);

// let readed = 0;
// rStream.on("data", (buf) => {
//     readed += buf.length;
//     console.log(`${(readed/inputSize*100).toFixed(2)}%`)
// })
