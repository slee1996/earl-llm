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
async function Chat({ lineLimit, targetSyllables }) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Compose ${lineLimit} bars for a rap song centered around dogs. Ensure each bar contains exactly ${targetSyllables} syllables. Please provide only the bars, with each one ending in a newline character. Make the lyrics engaging and creative, reflecting the unique characteristics and playful nature of dogs.`,
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
