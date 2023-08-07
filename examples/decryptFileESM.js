import { scrypt, createDecipheriv } from "node:crypto";
import { readFile, writeFile } from "node:fs";
import { argv, exit } from "node:process";
const [input, output, password, salt] = argv.slice(2, 6);

scrypt(password, salt, 24, (err, key) => {
  if (err !== null) {
    console.log("Failed to generate key from password and salt");
    console.log(err);
    exit(1);
  }

  const decipher = createDecipheriv("aes-192-cbc", key, Buffer.alloc(16, 0));

  readFile(input, (err, data) => {
    if (err !== null) {
      console.log("Failed to read input file");
      console.log(err);
      exit(2);
    }

    let decrypted = decipher.update(data);
    decrypted += decipher.final();

    writeFile(output, decrypted, "utf-8", (err) => {
      if (err !== null) {
        console.log("Failed to write to output file.");
        console.log(err);
        exit(3);
      } else {
        exit(0);
      }
    });
  });
});
