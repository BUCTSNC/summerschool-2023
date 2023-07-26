const { scrypt, createCipheriv } = await import("node:crypto");
const { readFile, writeFile } = await import("node:fs");
const { argv, exit } = await import("node:process");

const [input, output, password, salt] = argv.slice(2, 6);

scrypt(password, salt, 24, (err, key) => {
  if (err !== null) {
    console.log("Failed to generate key from password and salt");
    console.log(err);
    exit(1);
  }

  const cipher = createCipheriv("aes-192-cbc", key, Buffer.alloc(16, 0));

  readFile(input, (err, data) => {
    if (err !== null) {
      console.log("Failed to read input file");
      console.log(err);
      exit(2);
    }

    const crypted = Buffer.concat([
      cipher.update(data), cipher.final()
    ])

    writeFile(output, crypted, (err) => {
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
