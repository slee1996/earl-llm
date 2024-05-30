require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

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
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Compose ${lineLimit} lyrics for a rap song. Limit each line to ${targetSyllables} syllables. Ensure each bar is written in this meter pattern ${meter}, with each number representing a syllable, a 0 is unstressed and a 1 is stressed.  Please provide only the lyrics, with each one ending in a newline character. Focus on maintaining a rhyme scheme. `,
      },
    ],
    model: "gpt-4o",
  });
  return chatCompletion;
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
async function CorrectionChat({ currentSyllables, targetSyllables, lyric }) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Rewrite this lyric to contain ${targetSyllables} syllables; it currently has ${currentSyllables} syllables. Ensure the new lyric rhymes with the old one. Return only the revised lyric, ending with a newline character.

        Here is the lyric: ${lyric}`,
      },
    ],
    model: "gpt-4o",
  });
  return chatCompletion;
}

module.exports = {
  Chat,
  CorrectionChat,
};
