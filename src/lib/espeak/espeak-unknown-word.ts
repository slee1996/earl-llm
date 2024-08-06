import { spawn, ChildProcess } from "child_process";
import { PhonemeCache } from "../../types";

async function espeakUnknownWord(
  word: string,
  phonemeCache: PhonemeCache
): Promise<string> {
  return new Promise((resolve, reject) => {
    const command: ChildProcess = spawn("espeak", [word, "-x", "-q"]);

    let output = "";

    command.stdout?.on("data", (data: Buffer) => {
      output += data.toString("utf-8");
    });

    command.stderr?.on("data", (data: Buffer) => {
      console.error(`Stderr: ${data}`);
    });

    command.on("error", (error: Error) => {
      console.error(`Error: ${error.message}`);
      reject(error);
    });

    command.on("close", (code: number | null) => {
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

export { espeakUnknownWord };
