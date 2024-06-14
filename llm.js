require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
  // baseURL: "http://localhost:8080/v1",
});

const SYSTEM_PROMPTS = {
  rapper:
    "You are LilBearBear, a generationally talented rapper celebrated for your intricate poetry and years of dedication to honing your craft. Your lyrics are renowned for their depth, complexity, and emotional resonance. Channel your experiences and insights to construct compelling narratives in your lyrics, blending raw emotion with masterful storytelling.",
  popstar:
    "You are Sapphire, a renowned pop artist and songwriter famed for your infectious hooks and bouncy verses. Your music captures the essence of contemporary pop with its vibrant energy and catchy melodies. Focus on creating songs that resonate with a wide audience, combining upbeat rhythms with relatable themes.",
};

/**
 * Generates a set of lyrics lines using a language model, based on the provided line limit and target syllables per line.
 *
 * This function sends a request to the OpenAI API to create a chat completion, asking the model to compose a specified number
 * of rap bars centered around dogs. Each bar is required to have a specific number of syllables.
 *
 * @async
 * @function Chat
 * @param {Object} params - The parameters for the chat completion request.
 * @param {number} params.lineLimit - The number of bars (lines) to generate.
 * @param {string} params.targetSyllables - The target syllable count for each bar.
 * @returns {Promise<Object>} A promise that resolves to the chat completion response from the OpenAI API.
 * @throws Will throw an error if the API request fails.
 */
async function Chat({ lineLimit, targetSyllables, meter }) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      temperature: 1.1,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPTS.popstar,
        },
        {
          role: "user",
          content: `Compose ${lineLimit} lines of lyrics for a song. Limit each line to ${targetSyllables} syllables. Ensure each bar is written in this meter pattern ${meter.join()}, with each number representing a syllable, a 0 is unstressed and a 1 is stressed. Please provide only the lyrics, with each one ending in a newline character. Focus on maintaining a rhyme scheme and constructing a narrative.`,
        },
      ],
      model: "gpt-4o",
    });
    return chatCompletion;
  } catch (err) {
    console.log(err);
  }
}

/**
 * Requests a correction of a given lyric to match a target syllable count using a language model.
 *
 * This function sends a request to the OpenAI API to rewrite a lyric so that it has the specified number of syllables.
 * The new lyric is also required to rhyme with the original one.
 *
 * @async
 * @function CorrectionChat
 * @param {Object} params - The parameters for the chat completion request.
 * @param {number} params.currentSyllables - The current syllable count of the lyric.
 * @param {number} params.targetSyllables - The target syllable count for the lyric.
 * @param {string} params.lyric - The original lyric to be corrected.
 * @returns {Promise<Object>} A promise that resolves to the chat completion response from the OpenAI API.
 * @throws Will throw an error if the API request fails.
 */
async function CorrectionChat({
  currentSyllables,
  targetSyllables,
  lyric,
  meter,
}) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      temperature: 1.1,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPTS.popstar,
        },
        {
          role: "user",
          content: `Please rewrite the following lyric to contain ${targetSyllables} syllables instead of its current ${currentSyllables} syllables. Ensure the bar is written in this meter pattern ${meter.join()}, with each number representing a syllable, a 0 is unstressed and a 1 is stressed. Ensure that the new lyric rhymes with the original. Provide only the revised lyric, ending with a newline character.\n\nHere is the lyric: ${lyric}`,
        },
      ],
      model: "gpt-4o",
    });
    return chatCompletion;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  Chat,
  CorrectionChat,
};
