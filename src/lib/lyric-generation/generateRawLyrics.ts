import { createChatObject } from "../utils";
import { RawLyricsOptions } from "../../types";

async function generateRawLyrics({
  lineLimit,
  meter,
  selectedUserPrompt,
  selectedSystemPrompt,
  restOfSong,
  customSystemPrompt,
  songTitle,
  songDescription,
  clientChoice = "anthropic",
  rhymeScheme
}: RawLyricsOptions): Promise<string[]> {
  try {
    const meterString = meter
      .map(
        (pattern, index) =>
          `Line ${
            index + 1
          } will use this pattern: ${pattern.join()} and have ${
            pattern.length
          } syllables.`
      )
      .join(" ");

    const alternatingInstructions =
      meter.length > 0
        ? "Make sure to use this alternating meter pattern: "
        : "";
    const finalString = alternatingInstructions + meterString;
    const chatCompletion = await createChatObject({
      clientChoice,
      customSystemPrompt,
      selectedSystemPrompt,
      selectedUserPrompt,
      lineLimit,
      finalString,
      restOfSong,
      songTitle,
      songDescription,
      rhymeScheme
    });

    switch (clientChoice) {
      case "llama":
        let llamaOutput = "";

        for await (const event of chatCompletion as AsyncIterable<any>) {
          llamaOutput += event.toString();
        }

        return llamaOutput
          .split("\n")
          .filter((e) => e.length > 0)
          .map((e) => e.trim());

      case "openai":
        return (chatCompletion as any).choices[0].message.content
          .split("\n")
          .filter((e: string) => e.length > 0)
          .map((e: string) => {
            const newStr = e
              .split(" ")
              .map((e: string) => e.replace(/\d/g, "").trim())
              .filter((e: string) => e.length > 0)
              .join(" ");

            return newStr.trim();
          });

      case "anthropic":
      default:
        return (chatCompletion as any).content[0].text
          .split("\n")
          .filter((e: string) => e.length > 0)
          .map((e: string) => e.trim());
    }
  } catch (err) {
    console.log(err);
    throw err; // Re-throw the error after logging
  }
}

export { generateRawLyrics };
