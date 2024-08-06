import dotenv from "dotenv";
import { openai } from "../../llm-clients";
import { SYSTEM_PROMPTS } from "../../constants";
import { ChatCompletion } from "openai/resources/chat";
import { CorrectionChatParams } from "../../types";

dotenv.config();

async function correctionChat({
  currentSyllables,
  targetSyllables,
  lyric,
  meter,
  currentLyrics,
  selectedSystemPrompt,
}: CorrectionChatParams): Promise<ChatCompletion | undefined> {
  try {
    const chatCompletion = await openai.chat.completions.create({
      temperature: 1.2,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPTS[selectedSystemPrompt],
        },
        {
          role: "user",
          content: `As a skilled lyricist, please revise the following lyric to contain exactly ${targetSyllables} syllables, as it currently has ${currentSyllables} syllables. When rewriting, ensure that the revised lyric follows this specific meter pattern: ${meter.join()}, where 0 represents an unstressed syllable and 1 represents a stressed syllable. Maintain the original rhyme scheme and preserve the overall meaning and intent of the lyric provided. Focus on making the necessary adjustments to the number of syllables while maintaining the artistic integrity of the piece.
          
          Lyric to revise: ${lyric}

          ${
            currentLyrics.length > 1
              ? `Here is the rest of the song for context: ${currentLyrics
                  .map((component) => {
                    return [component.component, ...component.lyrics];
                  })
                  .join("\n")}`
              : ""
          } Return only the revised lyric, ending with a newline character.`,
        },
      ],
      model: "gpt-4o",
    });
    return chatCompletion;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

export { correctionChat };
