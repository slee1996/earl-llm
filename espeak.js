const { spawn } = require("child_process");

async function espeakUnknownWord(word, phonemeCache) {
  return new Promise((resolve, reject) => {
    const command = spawn("espeak", [word, "-x", "-q"]);

    let output = "";

    command.stdout.on("data", (data) => {
      output += data.toString("utf-8");
    });

    command.stderr.on("data", (data) => {
      console.error(`Stderr: ${data}`);
    });

    command.on("error", (error) => {
      console.error(`Error: ${error.message}`);
      reject(error);
    });

    command.on("close", (code) => {
      if (code === 0) {
        const cleanedOutput = output.replace(/[\n\r]/g, "").trim();
        phonemeCache[word] = cleanedOutput; // Cache the result
        resolve(cleanedOutput);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

module.exports = {
  espeakUnknownWord,
};
