const { spawn } = require("child_process");

const phonemeCache = {};

async function espeakUnknownWord(word) {
  if (phonemeCache[word]) {
    return phonemeCache[word];
  }

  return new Promise((resolve, reject) => {
    const command = spawn("espeak", [word, "-x", "-q"]);

    let output = "";

    command.stdout.on("data", (data) => {
      console.log(`Stdout: ${(data)}`);
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
      console.log(`Child process exited with code ${code}`);
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
